export type ChatUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  online?: boolean;
  mutual?: boolean;
};

export type MessageWithSender = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  pending?: boolean;
  failed?: boolean;
};

export type ConversationWithUser = {
  id: string;
  participants: ChatUser[];
  otherUser: ChatUser;
  lastMessage: MessageWithSender | null;
  unreadCount: number;
  updatedAt: string;
};

export type SendMessagePayload = {
  conversationId: string;
  content: string;
};

export type SocketMessagePayload = {
  conversation: ConversationWithUser;
  message: MessageWithSender;
};

export type TypingPayload = {
  conversationId: string;
  userId: string;
};

export type OnlineStatusPayload = {
  userId: string;
};
