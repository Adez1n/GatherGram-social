"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  ConversationWithUser,
  MessageWithSender,
  SocketMessagePayload,
} from "@/types/message";

type MessagesResponse = {
  messages?: MessageWithSender[];
  nextCursor?: string | null;
  error?: string;
};

type SendMessageResponse = {
  message?: MessageWithSender;
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

function uniqueMessages(messages: MessageWithSender[]) {
  const seen = new Set<string>();
  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
}

export function useMessages(
  socket: Socket | null,
  conversation: ConversationWithUser | null,
  currentUserId: string,
) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const activeConversationId = conversation?.id ?? null;
  const activeConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const markAsRead = useCallback(async (conversationId: string) => {
    await fetch("/api/messages/read", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ conversationId }),
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/messages/${activeConversationId}?limit=30`, {
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as MessagesResponse;

      if (!response.ok) {
        setError(data.error ?? "No se pudieron cargar los mensajes.");
        return;
      }

      setMessages(data.messages ?? []);
      setNextCursor(data.nextCursor ?? null);
      await markAsRead(activeConversationId);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, markAsRead]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  async function loadMore() {
    if (!activeConversationId || !nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch(
        `/api/messages/${activeConversationId}?limit=30&cursor=${nextCursor}`,
        { headers: getAuthHeaders() },
      );
      const data = (await response.json()) as MessagesResponse;

      if (response.ok) {
        setMessages((current) =>
          uniqueMessages([...(data.messages ?? []), ...current]),
        );
        setNextCursor(data.nextCursor ?? null);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function sendMessage(content: string) {
    if (!activeConversationId) {
      return;
    }

    const temporaryId = `temp-${crypto.randomUUID()}`;
    const optimisticMessage: MessageWithSender = {
      id: temporaryId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content,
        }),
      });
      const data = (await response.json()) as SendMessageResponse;

      if (!response.ok || !data.message) {
        setMessages((current) =>
          current.map((message) =>
            message.id === temporaryId
              ? { ...message, pending: false, failed: true }
              : message,
          ),
        );
        setError(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }

      setMessages((current) =>
        uniqueMessages(
          current.map((message) =>
            message.id === temporaryId ? data.message! : message,
          ),
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === temporaryId
            ? { ...message, pending: false, failed: true }
            : message,
        ),
      );
      setError("No se pudo conectar con el servidor.");
    }
  }

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleMessageNew(payload: SocketMessagePayload) {
      if (payload.message.conversationId !== activeConversationIdRef.current) {
        return;
      }

      setMessages((current) => uniqueMessages([...current, payload.message]));

      if (payload.message.senderId !== currentUserId) {
        void markAsRead(payload.message.conversationId);
      }
    }

    function handleRead(payload: { conversationId: string; readerId: string }) {
      if (payload.conversationId !== activeConversationIdRef.current) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          message.senderId === currentUserId ? { ...message, read: true } : message,
        ),
      );
    }

    socket.on("message:new", handleMessageNew);
    socket.on("message:read", handleRead);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("message:read", handleRead);
    };
  }, [currentUserId, markAsRead, socket]);

  return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    nextCursor,
    loadMore,
    sendMessage,
  };
}
