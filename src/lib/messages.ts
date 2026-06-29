import { prisma } from "@/src/lib/prisma";
import { isUserOnline } from "@/src/lib/online-users";
import type {
  ChatUser,
  ConversationWithUser,
  MessageWithSender,
} from "@/types/message";

type ConversationForView = Awaited<ReturnType<typeof getConversationByIdForUser>>;

export function toChatUser(user: {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
}): ChatUser {
  return {
    id: user.id,
    name: user.name ?? user.username,
    username: user.username,
    avatar: user.avatar,
    online: isUserOnline(user.id),
  };
}

export function toMessageView(message: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MessageWithSender {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export async function getConversationByIdForUser(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: { userId },
      },
    },
    select: {
      id: true,
      updatedAt: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          read: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function toConversationView(
  conversation: NonNullable<ConversationForView>,
  currentUserId: string,
): Promise<ConversationWithUser> {
  const participants = conversation.participants.map((participant) =>
    toChatUser(participant.user),
  );
  const otherUser = participants.find((participant) => participant.id !== currentUserId);
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderId: { not: currentUserId },
      read: false,
    },
  });

  return {
    id: conversation.id,
    participants,
    otherUser: otherUser ?? participants[0],
    lastMessage: conversation.messages[0]
      ? toMessageView(conversation.messages[0])
      : null,
    unreadCount,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function getConversationView(conversationId: string, currentUserId: string) {
  const conversation = await getConversationByIdForUser(conversationId, currentUserId);

  if (!conversation) {
    return null;
  }

  return toConversationView(conversation, currentUserId);
}

export async function getParticipantUserIds(conversationId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  return participants.map((participant) => participant.userId);
}
