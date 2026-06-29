"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { TypingPayload } from "@/types/message";

export function useTyping(
  socket: Socket | null,
  conversationId: string | null,
  currentUserId: string,
) {
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleTypingStart(payload: TypingPayload) {
      if (payload.conversationId !== conversationId || payload.userId === currentUserId) {
        return;
      }

      setTypingUserId(payload.userId);

      if (stopTypingTimeout.current) {
        clearTimeout(stopTypingTimeout.current);
      }

      stopTypingTimeout.current = setTimeout(() => setTypingUserId(null), 2500);
    }

    function handleTypingStop(payload: TypingPayload) {
      if (payload.conversationId === conversationId) {
        setTypingUserId(null);
      }
    }

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [conversationId, currentUserId, socket]);

  function notifyTyping() {
    if (!socket || !conversationId) {
      return;
    }

    socket.emit("typing:start", { conversationId });

    if (localTypingTimeout.current) {
      clearTimeout(localTypingTimeout.current);
    }

    localTypingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 1000);
  }

  return {
    typingUserId,
    notifyTyping,
  };
}
