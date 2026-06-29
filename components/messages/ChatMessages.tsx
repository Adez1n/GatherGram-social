"use client";

import { useEffect, useRef, useState } from "react";
import type { MessageWithSender } from "@/types/message";
import DateSeparator from "@/components/messages/DateSeparator";
import LoadingMessages from "@/components/messages/LoadingMessages";
import MessageBubble from "@/components/messages/MessageBubble";
import NewMessagesButton from "@/components/messages/NewMessagesButton";

type ChatMessagesProps = {
  messages: MessageWithSender[];
  currentUserId: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function isSameDay(a: string, b?: string) {
  if (!b) {
    return false;
  }

  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatMessages({
  messages,
  currentUserId,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: ChatMessagesProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const lastMessageId = messages[messages.length - 1]?.id;

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    endRef.current?.scrollIntoView({ behavior });
    setShowNewMessagesButton(false);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;

    if (distanceFromBottom < 160) {
      scrollToBottom("smooth");
    } else {
      setShowNewMessagesButton(true);
    }
  }, [lastMessageId]);

  function handleScroll() {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    if (scroller.scrollTop < 80 && hasMore && !isLoadingMore) {
      onLoadMore();
    }

    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    setShowNewMessagesButton(distanceFromBottom > 260);
  }

  if (isLoading) {
    return <LoadingMessages />;
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4"
      >
        {isLoadingMore ? (
          <p className="pb-3 text-center text-xs font-bold text-[#A3A3A3]">
            Cargando mensajes anteriores...
          </p>
        ) : null}

        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message.id}>
              {!isSameDay(message.createdAt, messages[index - 1]?.createdAt) ? (
                <DateSeparator date={formatDate(message.createdAt)} />
              ) : null}
              <MessageBubble
                message={message}
                own={message.senderId === currentUserId}
              />
            </div>
          ))}
        </div>
        <div ref={endRef} />
      </div>

      {showNewMessagesButton ? (
        <NewMessagesButton onClick={() => scrollToBottom("smooth")} />
      ) : null}
    </div>
  );
}
