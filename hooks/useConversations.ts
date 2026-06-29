"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ConversationWithUser, SocketMessagePayload } from "@/types/message";

type ConversationsResponse = {
  conversations?: ConversationWithUser[];
  error?: string;
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function sortConversations(conversations: ConversationWithUser[]) {
  return [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function useConversations(socket: Socket | null) {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUserId =
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("gathergram_user_id") ?? "";

  const loadConversations = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/messages", {
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as ConversationsResponse;

      if (!response.ok) {
        setError(data.error ?? "No se pudieron cargar los mensajes.");
        return;
      }

      setConversations(sortConversations(data.conversations ?? []));
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    function upsertConversation(conversation: ConversationWithUser) {
      setConversations((current) => {
        const exists = current.some((item) => item.id === conversation.id);
        const next = exists
          ? current.map((item) => (item.id === conversation.id ? conversation : item))
          : [conversation, ...current];

        return sortConversations(next);
      });
    }

    function handleMessageNew(payload: SocketMessagePayload) {
      upsertConversation(payload.conversation);
    }

    function handleConversationUpdate(payload: { conversation: ConversationWithUser }) {
      upsertConversation(payload.conversation);
    }

    socket.on("message:new", handleMessageNew);
    socket.on("conversation:update", handleConversationUpdate);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("conversation:update", handleConversationUpdate);
    };
  }, [socket]);

  const totalUnread = useMemo(
    () => conversations.reduce((total, item) => total + item.unreadCount, 0),
    [conversations],
  );

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    reload: loadConversations,
    currentUserId,
    totalUnread,
  };
}
