import type { ConversationWithUser } from "@/types/message";
import OnlineIndicator from "@/components/messages/OnlineIndicator";
import UnreadBadge from "@/components/messages/UnreadBadge";

type ConversationItemProps = {
  conversation: ConversationWithUser;
  active: boolean;
  onSelect: () => void;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ConversationItem({
  conversation,
  active,
  onSelect,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors duration-200 ${
        active
          ? "border-[#3DD9EB]/40 bg-[#3DD9EB]/10"
          : "border-transparent hover:border-[#2E2E2E] hover:bg-[#202020]"
      }`}
    >
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={conversation.otherUser.avatar || "/default-avatar.svg"}
          alt={`Avatar de ${conversation.otherUser.name}`}
          className="h-12 w-12 rounded-full border border-[#2E2E2E] object-cover"
        />
        <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#181818]">
          <OnlineIndicator online={conversation.otherUser.online} />
        </span>
      </div>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-black text-[#F5F5F5]">
            {conversation.otherUser.name}
          </span>
          <span className="shrink-0 text-[11px] font-bold text-[#6B7280]">
            {formatTime(conversation.updatedAt)}
          </span>
        </span>
        <span className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-[#A3A3A3]">
            {conversation.lastMessage?.content ?? `@${conversation.otherUser.username}`}
          </span>
          <UnreadBadge count={conversation.unreadCount} />
        </span>
      </span>
    </button>
  );
}
