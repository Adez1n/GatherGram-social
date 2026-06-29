"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConversationWithUser } from "@/types/message";
import { useConversations } from "@/hooks/useConversations";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSocket } from "@/hooks/useSocket";
import ChatPanel from "@/components/messages/ChatPanel";
import ChatSidebar from "@/components/messages/ChatSidebar";

export default function ChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, connected } = useSocket();
  const {
    conversations,
    setConversations,
    isLoading,
    error,
    currentUserId,
  } = useConversations(socket);
  const onlineUsers = useOnlineStatus(socket);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("gathergram_token");
    const userId = localStorage.getItem("gathergram_user_id");

    if (!token && !userId) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");

    if (conversationId) {
      const timer = window.setTimeout(() => {
        setActiveConversationId(conversationId);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  const conversationsWithOnline = useMemo(
    () =>
      conversations.map((conversation) => ({
        ...conversation,
        otherUser: {
          ...conversation.otherUser,
          online:
            onlineUsers[conversation.otherUser.id] ??
            conversation.otherUser.online,
        },
      })),
    [conversations, onlineUsers],
  );

  const activeConversation =
    conversationsWithOnline.find(
      (conversation) => conversation.id === activeConversationId,
    ) ?? null;

  function upsertConversation(conversation: ConversationWithUser) {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      return exists
        ? current.map((item) =>
            item.id === conversation.id ? conversation : item,
          )
        : [conversation, ...current];
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl gap-4 pb-8">
      <ChatSidebar
        conversations={conversationsWithOnline}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        onSelect={(conversation) => setActiveConversationId(conversation.id)}
        onConversationCreated={upsertConversation}
        hiddenOnMobile={Boolean(activeConversationId)}
      />
      <ChatPanel
        socket={socket}
        conversation={activeConversation}
        currentUserId={currentUserId}
        onBack={() => setActiveConversationId(null)}
        hiddenOnMobile={!activeConversationId}
      />
      <span className="sr-only">
        {connected ? "Socket conectado" : "Socket desconectado"}
        {error}
      </span>
    </section>
  );
}
