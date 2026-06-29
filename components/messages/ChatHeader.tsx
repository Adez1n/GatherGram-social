import type { ConversationWithUser } from "@/types/message";
import OnlineIndicator from "@/components/messages/OnlineIndicator";

type ChatHeaderProps = {
  conversation: ConversationWithUser;
  onBack: () => void;
};

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-[#2E2E2E] px-4">
      <button
        type="button"
        onClick={onBack}
        className="grid h-10 w-10 place-items-center rounded-md text-[#F5F5F5] hover:bg-[#2A2A2A] md:hidden"
        aria-label="Volver"
      >
        <i className="bi bi-arrow-left" aria-hidden="true" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={conversation.otherUser.avatar || "/default-avatar.svg"}
        alt={conversation.otherUser.name}
        className="h-11 w-11 rounded-full border border-[#2E2E2E] object-cover"
      />
      <div className="min-w-0">
        <h2 className="truncate text-sm font-black text-[#F5F5F5]">
          {conversation.otherUser.name}
        </h2>
        <p className="flex items-center gap-2 text-xs text-[#A3A3A3]">
          <OnlineIndicator online={conversation.otherUser.online} />
          @{conversation.otherUser.username}
        </p>
      </div>
    </header>
  );
}
