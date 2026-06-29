import type { ConversationWithUser } from "@/types/message";
import ConversationItem from "@/components/messages/ConversationItem";
import EmptyConversations from "@/components/messages/EmptyConversations";

type ConversationListProps = {
  conversations: ConversationWithUser[];
  activeConversationId: string | null;
  onSelect: (conversation: ConversationWithUser) => void;
};

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return <EmptyConversations />;
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          active={conversation.id === activeConversationId}
          onSelect={() => onSelect(conversation)}
        />
      ))}
    </div>
  );
}
