import os
from pathlib import Path
from dotenv import load_dotenv

# 1. Load parent and local .env files first
parent_env = Path(__file__).resolve().parent.parent / ".env"
if parent_env.exists():
    load_dotenv(parent_env)

local_env = Path(__file__).resolve().parent / ".env"
if local_env.exists():
    load_dotenv(local_env)

# 2. Import Vision Agents core and plugins
from vision_agents.core import Agent, AgentLauncher, User, Runner
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream
from gemini_realtime import GeminiRealtime

async def create_agent(**kwargs) -> Agent:
    """
    Initializes and returns the AI Language Teacher Agent.
    
    Expected keyword arguments:
    - language (str): The target language to teach (default: "Spanish").
    - voice (str): Optional voice personality (default: "marin").
    """
    target_language = (
        kwargs.get("language") or 
        kwargs.get("selected_language") or 
        kwargs.get("target_language") or 
        "Spanish"
    )
    
    selected_voice = kwargs.get("voice") or "marin"
    
    # 3. Construct clear, detailed English-first teaching instructions
    instructions = (
        "You are a friendly, encouraging, and patient AI language teacher.\n"
        "Your name is Sarah. You speak English natively and teach the user through English.\n"
        f"You are helping them learn {target_language}.\n\n"
        "Guiding principles:\n"
        f"- Always speak English by default to guide the lesson, explain grammar, vocabulary, and pronunciation.\n"
        f"- Speak and practice short, simple conversational phrases in {target_language}.\n"
        f"- Prompt the user to repeat vocabulary, translate simple sentences, and speak in {target_language}.\n"
        f"- Listen closely and gently correct any pronunciation or grammar mistakes they make in {target_language}.\n"
        "- Reply in concise, conversational sentences suitable for a natural voice-only call. Avoid long blocks of text."
    )
    
    # Map any OpenAI voice names to beautiful Gemini prebuilt voice names (default to Puck)
    gemini_voice = "Puck"
    if selected_voice.lower() in ["puck", "charon", "kore", "fenrir", "aoede"]:
        gemini_voice = selected_voice

    print(f"Creating teacher agent with Gemini Realtime. Language: {target_language}, Voice: {gemini_voice}")
    
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Sarah", id="agent-teacher"),
        instructions=instructions,
        llm=GeminiRealtime(
            model="models/gemini-3.1-flash-live-preview",
            voice=gemini_voice,
            api_key=os.environ.get("GEMINI_API_KEY")
        ),
    )

async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    """
    Orchestrates the lifecycle of the agent joining, interacting, and exiting the call cleanly.
    """
    print(f"Resolving/creating call: {call_type}:{call_id}")
    call = await agent.create_call(call_type, call_id)
    
    title = "First Greetings"
    language_name = "Spanish"
    
    # Fetch Call Custom data to retrieve packed metadata
    try:
        call_response = await call.get()
        custom = {}
        
        # Robustly inspect response object for call details
        if hasattr(call_response, "call") and hasattr(call_response.call, "custom"):
            custom = call_response.call.custom
        elif isinstance(call_response, dict):
            custom = call_response.get("call", {}).get("custom", {})
        elif hasattr(call_response, "data") and hasattr(call_response.data, "call") and hasattr(call_response.data.call, "custom"):
            custom = call_response.data.call.custom
        elif hasattr(call_response, "custom"):
            custom = call_response.custom
            
        print(f"Fetched call custom data: {custom}")
        
        lesson_id = custom.get("lessonId", "")
        language_id = custom.get("languageId", "")
        language_name = custom.get("languageName", "Spanish")
        title = custom.get("title", "First Greetings")
        goals = custom.get("goals", [])
        vocabulary = custom.get("vocabulary", [])
        phrases = custom.get("phrases", [])
        ai_teacher_prompt = custom.get("aiTeacherPrompt", {})
        
        # Build dynamic list strings
        goals_str = "\n".join([f"- {g.get('text', '')}" if isinstance(g, dict) else f"- {g}" for g in goals])
        vocab_str = "\n".join([f"- {v.get('term', '')}: {v.get('translation', '')} ({v.get('partOfSpeech', '')})" if isinstance(v, dict) else f"- {v}" for v in vocabulary])
        phrases_str = "\n".join([f"- {p.get('text', '')}: {p.get('translation', '')}" if isinstance(p, dict) else f"- {p}" for p in phrases])
        
        persona = ai_teacher_prompt.get("persona", "You are a friendly, encouraging, and patient AI language teacher.")
        brief = ai_teacher_prompt.get("lessonBrief", "")
        audio_instr = ai_teacher_prompt.get("audioInstructions", "")
        correction_style = ai_teacher_prompt.get("correctionStyle", "")
        wrap_up = ai_teacher_prompt.get("wrapUpPrompt", "")

        new_instructions = (
            f"{persona}\n"
            f"Your name is Sarah. You speak English natively and teach the user through English.\n"
            f"You are helping them learn {language_name} in the lesson '{title}'.\n\n"
            f"Lesson Overview:\n"
            f"{brief}\n\n"
            f"Lesson Goals:\n"
            f"{goals_str}\n\n"
            f"Vocabulary to practice:\n"
            f"{vocab_str}\n\n"
            f"Target Phrases to practice:\n"
            f"{phrases_str}\n\n"
            f"Teaching & Audio Guidelines:\n"
            f"{audio_instr}\n"
            f"- Always speak English by default to guide the lesson, explain grammar, vocabulary, and pronunciation.\n"
            f"- Speak and practice short, simple conversational phrases in {language_name}.\n"
            f"- Prompt the user to repeat vocabulary, translate simple sentences, and speak in {language_name}.\n"
            f"- Listen closely and gently correct any pronunciation or grammar mistakes they make in {language_name}.\n"
            f"- Reply in concise, conversational sentences suitable for a natural voice-only call. Avoid long blocks of text.\n\n"
            f"Correction Style:\n"
            f"{correction_style}\n\n"
            f"Wrap Up instructions:\n"
            f"{wrap_up}\n"
        )
        
        agent.instructions = Instructions(input_text=new_instructions)
        agent.llm.set_instructions(agent.instructions)
        print("Successfully compiled and set dynamic agent instructions!")
        
    except Exception as e:
        print(f"Error fetching call or setting dynamic instructions: {e}")
    
    print(f"Joining call: {call_id}")
    try:
        async with agent.join(call):
            print("Joined successfully! Introducing teacher to user...")
            # Trigger an initial greeting using simple_response to speak directly to the user
            await agent.simple_response(
                f"Introduce yourself as Sarah, their AI language teacher. Welcome them to today's lesson '{title}' in {language_name}. Encourage them and ask if they are ready to begin."
            )
            
            # Keep the session running until the call ends or the participant disconnects
            print("Agent is active and listening. Awaiting call termination...")
            await agent.finish()
    except Exception as e:
        print(f"\n❌ ERROR: Failed to join call session due to Gemini API limits or configuration: {e}\n")
        raise e
        
    print("Agent left call cleanly.")

if __name__ == "__main__":
    # Launch the HTTP / CLI runner
    Runner(AgentLauncher(create_agent=create_agent, join_call=join_call)).cli()
