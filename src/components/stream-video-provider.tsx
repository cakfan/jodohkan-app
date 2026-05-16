"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useStreamChat } from "./stream-chat-provider";

interface StreamVideoContextValue {
  videoClient: StreamVideoClient | null;
}

const StreamVideoCtx = createContext<StreamVideoContextValue>({
  videoClient: null,
});

export function useStreamVideo() {
  return useContext(StreamVideoCtx);
}

export function StreamVideoProvider({ children }: { children: ReactNode }) {
  const { tokenData } = useStreamChat();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!tokenData) return;

    let cancelled = false;

    const init = async () => {
      const c = new StreamVideoClient({
        apiKey: tokenData.apiKey,
        user: { id: tokenData.userId, name: tokenData.name },
        token: tokenData.videoToken,
      });

      if (!cancelled) {
        clientRef.current = c;
        setVideoClient(c);
      } else {
        await c.disconnectUser().catch(() => {});
      }
    };

    init();

    return () => {
      cancelled = true;
      clientRef.current?.disconnectUser().catch(() => {});
      clientRef.current = null;
      setVideoClient(null);
    };
  }, [tokenData]);

  return (
    <StreamVideoCtx.Provider value={{ videoClient }}>
      {children}
    </StreamVideoCtx.Provider>
  );
}
