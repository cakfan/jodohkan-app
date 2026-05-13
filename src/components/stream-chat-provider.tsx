"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { StreamChat } from "stream-chat";
import { getStreamToken } from "@/app/actions/stream";

interface TokenData {
  chatToken: string;
  apiKey: string;
  userId: string;
  name: string;
  role: string | null;
}

interface StreamChatContextValue {
  client: StreamChat | null;
  tokenData: TokenData | null;
  error: string | null;
}

const StreamChatCtx = createContext<StreamChatContextValue>({
  client: null,
  tokenData: null,
  error: null,
});

export function useStreamChat() {
  return useContext(StreamChatCtx);
}

export function StreamChatProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    getStreamToken().then((data) => {
      if (data) {
        setTokenData(data);
      } else {
        setError(
          "Gagal mendapatkan token chat. Pastikan STREAM_API_KEY dan STREAM_API_SECRET sudah diisi."
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!tokenData) return;

    let cancelled = false;

    const init = async () => {
      try {
        const c = new StreamChat(tokenData.apiKey, undefined, { timeout: 10000 });
        await c.connectUser(
          { id: tokenData.userId, name: tokenData.name },
          tokenData.chatToken
        );
        if (!cancelled) {
          clientRef.current = c;
          setClient(c);
        } else {
          await c.disconnectUser().catch(() => {});
        }
      } catch {
        setError("Gagal terhubung ke server chat.");
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [tokenData]);

  return (
    <StreamChatCtx.Provider value={{ client, tokenData, error }}>
      {children}
    </StreamChatCtx.Provider>
  );
}
