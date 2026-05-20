import asyncio
import base64
import json
import logging
import os
from typing import Any, AsyncIterator, Dict, Optional, Union

import websockets
from getstream.video.rtc.track_util import PcmData
from vision_agents.core.edge.types import Participant
from vision_agents.core.instructions import Instructions
from vision_agents.core.llm import realtime
from vision_agents.core.llm.llm import LLMResponseDelta, LLMResponseFinal

logger = logging.getLogger(__name__)


class GeminiRealtime(realtime.Realtime):
    """
    Google Gemini Multimodal Live API implementation for real-time speech-to-speech interaction.

    Extends the base Realtime class with a stateful WebSocket connection to the
    Gemini Live API endpoint. Handles audio streaming, agent response playing,
    and agent transcriptions.
    """

    provider_name = "gemini_realtime"

    def __init__(
        self,
        model: str = "models/gemini-3.1-flash-live-preview",
        api_key: Optional[str] = None,
        voice: str = "Puck",
        fps: int = 1,
    ):
        super().__init__(fps)
        self.model = model
        self.voice = voice

        # Resolve API Key using robust absolute path searches
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            from pathlib import Path
            from dotenv import load_dotenv
            
            # Explicitly search local directory
            local_env = Path(__file__).resolve().parent / ".env"
            if local_env.exists():
                logger.info(f"Loading local .env from absolute path: {local_env}")
                load_dotenv(local_env, override=True)
            else:
                # Explicitly search parent directory
                parent_env = Path(__file__).resolve().parent.parent / ".env"
                if parent_env.exists():
                    logger.info(f"Loading parent .env from absolute path: {parent_env}")
                    load_dotenv(parent_env, override=True)
            
            self.api_key = os.environ.get("GEMINI_API_KEY")

        if self.api_key:
            logger.info("Successfully resolved GEMINI_API_KEY from environment or file.")
        else:
            logger.warning("GEMINI_API_KEY could not be resolved during initialization.")

        self.websocket: Optional[websockets.WebSocketClientProtocol] = None
        self._consumer_task: Optional[asyncio.Task] = None
        self._agent_transcript_accumulator: list[str] = []
        self._setup_ready_event = asyncio.Event()

    async def connect(self):
        """Establish the WebSocket connection to Gemini Multimodal Live API."""
        if not self.api_key:
            # Try resolving once more in case env changed
            self.api_key = os.environ.get("GEMINI_API_KEY")
            
        if not self.api_key:
            from pathlib import Path
            from dotenv import load_dotenv
            local_env = Path(__file__).resolve().parent / ".env"
            if local_env.exists():
                load_dotenv(local_env, override=True)
            parent_env = Path(__file__).resolve().parent.parent / ".env"
            if parent_env.exists():
                load_dotenv(parent_env, override=True)
            self.api_key = os.environ.get("GEMINI_API_KEY")

        if not self.api_key:
            # Log all environment keys (excluding values for safety) to diagnose loading issues
            env_keys = list(os.environ.keys())
            logger.error(f"Failed to find GEMINI_API_KEY. Current environment keys: {env_keys}")
            raise ValueError("GEMINI_API_KEY must be configured in environment or passed to constructor.")

        # API endpoint for Gemini Multimodal Live WebSocket (v1beta GenerativeService)
        url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={self.api_key}"
        logger.info(f"Connecting to Gemini Live API (model: {self.model}, voice: {self.voice})")
        print(f"DEBUG: Connecting to Gemini Live API: {url.split('?')[0]}?key=...", flush=True)

        try:
            self.websocket = await websockets.connect(url)
            print("DEBUG: WebSocket connected successfully!", flush=True)
        except Exception as e:
            logger.error(f"Failed to connect to Gemini Live WebSocket: {e}")
            print(f"DEBUG: Failed to connect to Gemini Live WebSocket: {e}", flush=True)
            raise e

        # Immediately send the stateful setup configuration
        setup_message = {
            "setup": {
                "model": self.model,
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {
                        "voiceConfig": {
                            "prebuiltVoiceConfig": {
                                "voiceName": self.voice
                            }
                        }
                    }
                },
                "systemInstruction": {
                    "parts": [
                        {"text": self._instructions}
                    ]
                }
            }
        }

        logger.info("Sending BidiGenerateContentSetup configuration frame")
        print(f"DEBUG: Sending BidiGenerateContentSetup configuration frame for model {self.model} and voice {self.voice}...", flush=True)
        await self.websocket.send(json.dumps(setup_message))

        # Start the background read task
        self._consumer_task = asyncio.create_task(self._receive_loop())

        # Wait for SetupComplete to be received to ensure the session is fully established before returning
        try:
            print("DEBUG: Waiting for setupComplete...", flush=True)
            await asyncio.wait_for(self._setup_ready_event.wait(), timeout=5.0)
            print("DEBUG: setupComplete received successfully!", flush=True)
        except asyncio.TimeoutError:
            logger.warning("Timed out waiting for setupComplete from Gemini Live.")
            print("DEBUG: Timed out waiting for setupComplete from Gemini Live.", flush=True)

    async def simple_response(
        self,
        text: str,
        participant: Optional[Participant] = None,
    ) -> AsyncIterator[LLMResponseDelta | LLMResponseFinal]:
        """
        Send a discrete text prompt to the Gemini Live session.
        Uses clientContent JSON format to inject custom text instructions.
        """
        if not self.websocket:
            logger.warning("WebSocket not connected; cannot send simple_response text.")
            yield LLMResponseFinal()
            return

        logger.info(f"Sending text query to Gemini Live: {text}")
        message = {
            "clientContent": {
                "turns": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": text
                            }
                        ]
                    }
                ],
                "turnComplete": True
            }
        }

        try:
            await self.websocket.send(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending text turn to Gemini: {e}")
            self._emit_error_event(e, context="simple_response")

        yield LLMResponseFinal()

    async def simple_audio_response(self, pcm: PcmData, participant: Participant):
        """
        Send raw PCM audio from Stream Edge to Gemini Live WebSocket.
        Downsamples incoming PCM (e.g. 48kHz) to mono 16kHz PCM.
        """
        if not self.websocket:
            return

        try:
            # Resample audio chunk to 16kHz mono (Gemini's input requirement)
            if pcm.sample_rate != 16000:
                resampled = pcm.resample(16000)
            else:
                resampled = pcm

            raw_bytes = resampled.to_bytes()
            b64_data = base64.b64encode(raw_bytes).decode("utf-8")

            if not hasattr(self, "_audio_chunk_count"):
                self._audio_chunk_count = 0
            self._audio_chunk_count += 1
            if self._audio_chunk_count % 50 == 0:
                print(f"DEBUG: Sent 50 audio chunks to Gemini (current chunk rate={pcm.sample_rate}Hz, resampled to 16000Hz)", flush=True)

            message = {
                "realtimeInput": {
                    "mediaChunks": [
                        {
                            "mimeType": "audio/pcm;rate=16000",
                            "data": b64_data
                        }
                    ]
                }
            }
            await self.websocket.send(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to stream audio chunk to Gemini: {e}")
            print(f"DEBUG/ERROR: Failed to stream audio chunk to Gemini: {e}", flush=True)

    async def watch_video_track(
        self,
        track,
        shared_forwarder = None,
    ) -> None:
        """Not implemented since this is a voice-only agent."""
        pass

    async def stop_watching_video_track(self) -> None:
        """Not implemented since this is a voice-only agent."""
        pass

    async def close(self):
        """Cleanly close the session, tools, and connection."""
        await self._await_pending_tools()
        
        if self._consumer_task:
            self._consumer_task.cancel()
            try:
                await self._consumer_task
            except asyncio.CancelledError:
                pass
            self._consumer_task = None

        if self.websocket:
            try:
                await self.websocket.close()
            except Exception as e:
                logger.error(f"Error closing Gemini WebSocket: {e}")
            self.websocket = None

        self._emit_disconnected_event(was_clean=True)
        logger.info("Gemini Realtime connection closed cleanly.")

    async def _receive_loop(self):
        """Background task processing responses from the Gemini Live WebSocket."""
        print("DEBUG: Gemini Live _receive_loop started.", flush=True)
        try:
            async for message in self.websocket:
                if isinstance(message, bytes):
                    message_str = message.decode("utf-8")
                else:
                    message_str = message

                # Print a trimmed down snippet of the received message to avoid printing massive audio frames
                trimmed_msg = message_str if len(message_str) < 200 else message_str[:200] + "..."
                print(f"DEBUG: Received WebSocket message from Gemini: {trimmed_msg}", flush=True)
                data = json.loads(message_str)

                # 1. Handle Setup Acknowledgement
                if "setupComplete" in data:
                    logger.info("Gemini Live Setup Completed successfully.")
                    print("DEBUG: Gemini Live Setup Completed successfully.", flush=True)
                    self._emit_connected_event(
                        session_config={"model": self.model, "voice": self.voice},
                        capabilities=["text", "audio"],
                    )
                    self._setup_ready_event.set()
                    continue

                # 2. Handle Interruption (barge-in signal from VAD)
                if data.get("interrupted") is True:
                    logger.info("Barge-in detected: Gemini speaker interrupted.")
                    print("DEBUG: Barge-in detected! Gemini speaker interrupted.", flush=True)
                    await self.interrupt()
                    self._emit_audio_output_done_event(interrupted=True)
                    continue

                # 3. Handle Server Content Responses
                server_content = data.get("serverContent")
                if server_content:
                    # User Input speech transcription
                    input_transcription = server_content.get("inputTranscription")
                    if input_transcription:
                        text = ""
                        if isinstance(input_transcription, str):
                            text = input_transcription
                        elif isinstance(input_transcription, dict):
                            text = input_transcription.get("transcription") or input_transcription.get("text") or ""
                        if text:
                            print(f"DEBUG: User input speech transcription: {text}", flush=True)
                            self._emit_user_speech_transcription(text, mode="final")

                    # Model speaker output
                    model_turn = server_content.get("modelTurn")
                    if model_turn:
                        parts = model_turn.get("parts", [])
                        for part in parts:
                            # Inline audio output data (24kHz 16-bit mono)
                            inline_data = part.get("inlineData")
                            if inline_data:
                                mime_type = inline_data.get("mimeType", "")
                                b64_audio = inline_data.get("data", "")
                                if b64_audio:
                                    raw_audio_bytes = base64.b64decode(b64_audio)
                                    
                                    # Extract target rate, fallback to 24000
                                    rate = 24000
                                    if "rate=" in mime_type:
                                        try:
                                            rate = int(mime_type.split("rate=")[1].split(";")[0])
                                        except Exception:
                                            pass
                                            
                                    pcm = PcmData.from_bytes(raw_audio_bytes, sample_rate=rate)
                                    print(f"DEBUG: Emitting agent audio output chunk: rate={rate}, len={len(raw_audio_bytes)} bytes", flush=True)
                                    self._emit_audio_output_event(pcm)

                            # Model text transcriptions
                            text_part = part.get("text")
                            if text_part:
                                print(f"DEBUG: Agent text token: {text_part}", flush=True)
                                self._agent_transcript_accumulator.append(text_part)
                                self._emit_agent_speech_transcription(text_part, mode="delta")

                    # Turn Completed
                    if server_content.get("turnComplete") is True:
                        full_transcript = "".join(self._agent_transcript_accumulator)
                        print(f"DEBUG: Response turn complete. Full transcript: {full_transcript}", flush=True)
                        if full_transcript:
                            self._emit_agent_speech_transcription(full_transcript, mode="final")
                        self._agent_transcript_accumulator.clear()
                        self._emit_audio_output_done_event(interrupted=False)

        except asyncio.CancelledError:
            print("DEBUG: _receive_loop cancelled.", flush=True)
        except Exception as e:
            logger.exception("Exception in Gemini Live read consumer loop")
            print(f"DEBUG/ERROR: Exception in Gemini Live read consumer loop: {e}", flush=True)
            self._emit_error_event(e, context="receive_loop")
