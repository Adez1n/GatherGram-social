/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const onlineUsers =
  globalThis.gathergramOnlineUsers || new Map();
globalThis.gathergramOnlineUsers = onlineUsers;

function addOnlineUser(userId) {
  onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
}

function removeOnlineUser(userId) {
  const currentConnections = onlineUsers.get(userId) || 0;

  if (currentConnections <= 1) {
    onlineUsers.delete(userId);
    return;
  }

  onlineUsers.set(userId, currentConnections - 1);
}

async function getUserFromSocket(socket) {
  const token = socket.handshake.auth?.token;
  const userId = socket.handshake.auth?.userId;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (session && session.expiresAt > new Date()) {
      return session.user;
    }
  }

  if (userId) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  return null;
}

async function getRelevantUserIds(userId) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    select: {
      participants: {
        select: { userId: true },
      },
    },
  });

  return Array.from(
    new Set(
      conversations
        .flatMap((conversation) =>
          conversation.participants.map((participant) => participant.userId),
        )
        .filter((participantUserId) => participantUserId !== userId),
    ),
  );
}

async function getConversationParticipantIds(conversationId, userId) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    select: { id: true },
  });

  if (!participant) {
    return [];
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  return participants.map((item) => item.userId);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  globalThis.gathergramIo = io;

  io.use(async (socket, nextSocket) => {
    try {
      const user = await getUserFromSocket(socket);

      if (!user) {
        nextSocket(new Error("No autorizado"));
        return;
      }

      socket.data.user = {
        id: user.id,
        username: user.username,
      };
      nextSocket();
    } catch (error) {
      nextSocket(error);
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);
    addOnlineUser(userId);

    const relevantUserIds = await getRelevantUserIds(userId);
    relevantUserIds.forEach((relevantUserId) => {
      io.to(`user:${relevantUserId}`).emit("online", { userId });
    });

    socket.on("typing:start", async (payload) => {
      const participantIds = await getConversationParticipantIds(
        payload.conversationId,
        userId,
      );
      participantIds
        .filter((participantId) => participantId !== userId)
        .forEach((participantId) => {
          io.to(`user:${participantId}`).emit("typing:start", {
            conversationId: payload.conversationId,
            userId,
          });
        });
    });

    socket.on("typing:stop", async (payload) => {
      const participantIds = await getConversationParticipantIds(
        payload.conversationId,
        userId,
      );
      participantIds
        .filter((participantId) => participantId !== userId)
        .forEach((participantId) => {
          io.to(`user:${participantId}`).emit("typing:stop", {
            conversationId: payload.conversationId,
            userId,
          });
        });
    });

    socket.on("disconnect", async () => {
      removeOnlineUser(userId);

      if (onlineUsers.has(userId)) {
        return;
      }

      const nextRelevantUserIds = await getRelevantUserIds(userId);
      nextRelevantUserIds.forEach((relevantUserId) => {
        io.to(`user:${relevantUserId}`).emit("offline", { userId });
      });
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> GatherGram ready on http://${hostname}:${port}`);
  });
});
