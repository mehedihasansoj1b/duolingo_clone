import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform, NativeModules } from "react-native";

export const CallingState = {
  UNKNOWN: "unknown",
  IDLE: "idle",
  RINGING: "ringing",
  JOINING: "joining",
  JOINED: "joined",
  RECONNECTING: "reconnecting",
  LEFT: "left",
};

let StreamVideoClient: any;
let StreamVideo: any;
let StreamCall: any;
let useCallStateHooks: any;

let useMock = Platform.OS === "web";

if (Platform.OS !== "web") {
  // Check if WebRTC native modules are present before attempting require
  const hasWebRTC = NativeModules && (NativeModules.WebRTCModule || NativeModules.WebRTCBridge);
  if (!hasWebRTC) {
    console.warn(
      "Stream video WebRTC native module not found in NativeModules. Falling back to Mock implementation."
    );
    useMock = true;
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sdk = require("@stream-io/video-react-native-sdk");
      StreamVideoClient = sdk.StreamVideoClient;
      StreamVideo = sdk.StreamVideo;
      StreamCall = sdk.StreamCall;
      useCallStateHooks = sdk.useCallStateHooks;
      Object.assign(CallingState, sdk.CallingState);
    } catch (error: any) {
      console.warn(
        "Stream Native SDK failed to load. Falling back to Mock implementation.",
        error.message
      );
      useMock = true;
    }
  }
}

if (useMock) {
  // Web/Fallback Mock Implementation
  const StreamCallContext = createContext<any>(null);

  class MockCall {
    id: string;
    type: string;
    _callingState: string = CallingState.IDLE;
    _isMute: boolean = false;
    _listeners: Set<() => void> = new Set();

    constructor(type: string, id: string) {
      this.type = type;
      this.id = id;
    }

    _onChange() {
      this._listeners.forEach((l) => l());
    }

    subscribe(listener: () => void) {
      this._listeners.add(listener);
      return () => this._listeners.delete(listener);
    }

    async join(options?: any) {
      this._callingState = CallingState.JOINING;
      this._onChange();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this._callingState = CallingState.JOINED;
      this._onChange();
    }

    async leave() {
      this._callingState = CallingState.LEFT;
      this._onChange();
    }

    camera = {
      disable: async () => {},
      enable: async () => {},
    };

    microphone = {
      enable: async () => {
        this._isMute = false;
        this._onChange();
      },
      disable: async () => {
        this._isMute = true;
        this._onChange();
      },
      toggle: async () => {
        this._isMute = !this._isMute;
        this._onChange();
      },
    };
  }

  class MockStreamVideoClient {
    static instance: MockStreamVideoClient | null = null;
    apiKey: string;
    user: any;
    token: string;
    calls: Map<string, MockCall> = new Map();

    static getOrCreateInstance(options: { apiKey: string; user: any; token: string }) {
      if (!MockStreamVideoClient.instance) {
        MockStreamVideoClient.instance = new MockStreamVideoClient(options);
      }
      return MockStreamVideoClient.instance;
    }

    constructor(options: { apiKey: string; user: any; token: string }) {
      this.apiKey = options.apiKey;
      this.user = options.user;
      this.token = options.token;
    }

    call(type: string, id: string) {
      const key = `${type}:${id}`;
      if (!this.calls.has(key)) {
        this.calls.set(key, new MockCall(type, id));
      }
      return this.calls.get(key);
    }

    async disconnectUser() {
      MockStreamVideoClient.instance = null;
    }
  }

  StreamVideoClient = MockStreamVideoClient;

  StreamVideo = function StreamVideo({ children }: { children: React.ReactNode; client: any }) {
    return <>{children}</>;
  };
  StreamVideo.displayName = "StreamVideo";

  StreamCall = function StreamCall({ children, call }: { children: React.ReactNode; call: any }) {
    return (
      <StreamCallContext.Provider value={call}>
        {children}
      </StreamCallContext.Provider>
    );
  };
  StreamCall.displayName = "StreamCall";

  useCallStateHooks = function useCallStateHooks() {
    const call = useContext(StreamCallContext);

    const useMicrophoneState = () => {
      const [isMute, setIsMute] = useState(call ? call._isMute : false);

      useEffect(() => {
        if (!call) return;
        setIsMute(call._isMute);
        return call.subscribe(() => {
          setIsMute(call._isMute);
        });
      }, [call]);

      return {
        microphone: {
          toggle: async () => {
            if (call) {
              await call.microphone.toggle();
            }
          },
        },
        isMute,
      };
    };

    const useCallCallingState = () => {
      const [callingState, setCallingState] = useState(call ? call._callingState : CallingState.IDLE);

      useEffect(() => {
        if (!call) return;
        setCallingState(call._callingState);
        return call.subscribe(() => {
          setCallingState(call._callingState);
        });
      }, [call]);

      return callingState;
    };

    return {
      useMicrophoneState,
      useCallCallingState,
    };
  };
}

export { StreamVideoClient, StreamVideo, StreamCall, useCallStateHooks };
