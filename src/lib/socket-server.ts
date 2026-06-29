import type { Server } from "socket.io";
import type {
  ConversationWithUser,
  MessageWithSender,
  OnlineStatusPayload,
  TypingPayload,
} from "@/types/message";

type ServerToClientEvents = {
  "message:new": (payload: {
    conversation: ConversationWithUser;
    message: MessageWithSender;
  }) => void;
  "conversation:update": (payload: { conversation: ConversationWithUser }) => void;
  "message:read": (payload: { conversationId: string; readerId: string }) => void;
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;
  online: (payload: OnlineStatusPayload) => void;
  offline: (payload: OnlineStatusPayload) => void;
};

type SocketServer = Server<Record<string, never>, ServerToClientEvents>;

const globalForSocket = globalThis as unknown as {
  gathergramIo?: SocketServer;
};

export function setSocketServer(io: SocketServer) {
  globalForSocket.gathergramIo = io;
}

export function getSocketServer() {
  return globalForSocket.gathergramIo;
}

export function emitToUser(userId: string, event: keyof ServerToClientEvents, payload: unknown) {
  const io = getSocketServer();

  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload as never);
}
