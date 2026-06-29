"use client";

import type { Socket } from "socket.io-client";
import type { ConversationWithUser } from "@/types/message";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import ChatHeader from "@/components/messages/ChatHeader";
import ChatMessages from "@/components/messages/ChatMessages";
import EmptyChatState from "@/components/messages/EmptyChatState";
import MessageInput from "@/components/messages/MessageInput";
import TypingIndicator from "@/components/messages/TypingIndicator";

type ChatPanelProps = {
  socket: Socket | null;
  conversation: ConversationWithUser | null;
  currentUserId: string;
  onBack: () => void;
  hiddenOnMobile: boolean;
};

export default function ChatPanel({
  socket,
  conversation,
  currentUserId,
  onBack,
  hiddenOnMobile,
}: ChatPanelProps) {
  const {
    messages,
    isLoading,
    isLoadingMore,
    error,
    nextCursor,
    loadMore,
    sendMessage,
  } = useMessages(socket, conversation, currentUserId);
  const { typingUserId, notifyTyping } = useTyping(
    socket,
    conversation?.id ?? null,
    currentUserId,
  );

  if (!conversation) {
    return (
      <div className={hiddenOnMobile ? "hidden md:block md:flex-1" : "flex-1"}>
        <EmptyChatState />
      </div>
    );
  }

  return (
    <section
      className={`gg-card h-[calc(100vh-7.5rem)] min-w-0 flex-1 overflow-hidden rounded-3xl md:flex md:flex-col ${
        hiddenOnMobile ? "hidden" : "flex flex-col"
      }`}
    >
      <ChatHeader conversation={conversation} onBack={onBack} />
      {error ? (
        <p className="border-b border-white/10 px-4 py-2 text-sm text-cyan-200">
          {error}
        </p>
      ) : null}
      <ChatMessages
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={Boolean(nextCursor)}
        onLoadMore={loadMore}
      />
      <TypingIndicator visible={Boolean(typingUserId)} />
      <MessageInput onSend={sendMessage} onTyping={notifyTyping} />
    </section>
  );
}
