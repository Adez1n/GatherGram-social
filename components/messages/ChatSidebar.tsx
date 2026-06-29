"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatUser, ConversationWithUser } from "@/types/message";
import ChatSkeleton from "@/components/messages/ChatSkeleton";
import ConversationList from "@/components/messages/ConversationList";
import ConversationSearch from "@/components/messages/ConversationSearch";
import OnlineIndicator from "@/components/messages/OnlineIndicator";

type ChatSidebarProps = {
  conversations: ConversationWithUser[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversation: ConversationWithUser) => void;
  onConversationCreated: (conversation: ConversationWithUser) => void;
  hiddenOnMobile: boolean;
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  isLoading,
  onSelect,
  onConversationCreated,
  hiddenOnMobile,
}: ChatSidebarProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [mutualUsers, setMutualUsers] = useState<ChatUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch("/api/messages/users", {
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as {
        mutualUsers?: ChatUser[];
        users?: ChatUser[];
      };

      if (response.ok) {
        setUsers(data.users ?? []);
        setMutualUsers(data.mutualUsers ?? []);
      }
    }

    void loadUsers();
  }, []);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.otherUser.name.toLowerCase().includes(normalizedQuery) ||
        conversation.otherUser.username.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [conversations, query]);

  const conversationUserIds = useMemo(
    () => new Set(conversations.map((conversation) => conversation.otherUser.id)),
    [conversations],
  );

  const filteredMutualUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mutualUsers
      .filter((user) => !conversationUserIds.has(user.id))
      .filter((user) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          user.name.toLowerCase().includes(normalizedQuery) ||
          user.username.toLowerCase().includes(normalizedQuery)
        );
      });
  }, [conversationUserIds, mutualUsers, query]);

  async function startConversation(targetUserId: string) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ targetUserId }),
    });
    const data = (await response.json()) as { conversation?: ConversationWithUser };

    if (response.ok && data.conversation) {
      onConversationCreated(data.conversation);
      onSelect(data.conversation);
      setShowNewChat(false);
    }
  }

  return (
    <aside
      className={`gg-card h-[calc(100vh-7.5rem)] rounded-3xl p-4 md:block md:w-[340px] ${
        hiddenOnMobile ? "hidden" : "block"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Mensajes</h1>
          <p className="text-sm text-[#A3A3A3]">Chats privados</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewChat((current) => !current)}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300 text-[#041012] transition hover:bg-cyan-200"
          aria-label="Nuevo chat"
        >
          <i className="bi bi-pencil-square" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4">
        <ConversationSearch value={query} onChange={setQuery} />
      </div>

      {showNewChat ? (
        <div className="mt-4 max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => startConversation(user.id)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.06]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar || "/default-avatar.svg"}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">
                  {user.name}
                </span>
                <span className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                  <OnlineIndicator online={user.online} /> @{user.username}
                  {user.mutual ? " · se siguen" : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 h-[calc(100%-8.5rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <div className="space-y-5">
            <ConversationList
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelect={onSelect}
            />

            {filteredMutualUsers.length > 0 ? (
              <section>
                <h2 className="mb-2 px-1 text-xs font-black uppercase tracking-normal text-[#6B7280]">
                  Personas
                </h2>
                <div className="space-y-1">
                  {filteredMutualUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => startConversation(user.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition-colors duration-200 hover:border-cyan-300/25 hover:bg-white/[0.06]"
                    >
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatar || "/default-avatar.svg"}
                          alt={user.name}
                          className="h-12 w-12 rounded-full border border-white/10 object-cover"
                        />
                        <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#0E1113]">
                          <OnlineIndicator online={user.online} />
                        </span>
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-white">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-[#A3A3A3]">
                          @{user.username} · se siguen mutuamente
                        </span>
                      </span>
                      <i className="bi bi-chat-dots-fill text-cyan-200" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
