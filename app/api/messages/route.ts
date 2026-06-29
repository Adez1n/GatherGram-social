import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { getConversationView, toConversationView, toMessageView } from "@/src/lib/messages";
import { emitToUser } from "@/src/lib/socket-server";
import { prisma } from "@/src/lib/prisma";
import { createConversationSchema } from "@/src/lib/validations/message";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: currentUser.id },
        },
      },
      orderBy: { updatedAt: "desc" },
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

    const conversationViews = await Promise.all(
      conversations.map((conversation) =>
        toConversationView(conversation, currentUser.id),
      ),
    );

    return jsonResponse({ conversations: conversationViews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = createConversationSchema.parse(await request.json());

    if (body.targetUserId === currentUser.id) {
      return errorResponse("No puedes crear una conversacion contigo mismo", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: body.targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return errorResponse("Usuario destino no encontrado", 404);
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUser.id } } },
          { participants: { some: { userId: body.targetUserId } } },
        ],
      },
      select: { id: true },
    });

    const conversationId =
      existingConversation?.id ??
      (
        await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: currentUser.id },
                { userId: body.targetUserId },
              ],
            },
          },
          select: { id: true },
        })
      ).id;

    let message = null;

    if (body.content) {
      message = await prisma.message.create({
        data: {
          conversationId,
          senderId: currentUser.id,
          content: body.content,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          read: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        select: { id: true },
      });
    }

    const [currentConversation, targetConversation] = await Promise.all([
      getConversationView(conversationId, currentUser.id),
      getConversationView(conversationId, body.targetUserId),
    ]);

    if (message && currentConversation && targetConversation) {
      const messageView = toMessageView(message);
      emitToUser(currentUser.id, "message:new", {
        conversation: currentConversation,
        message: messageView,
      });
      emitToUser(body.targetUserId, "message:new", {
        conversation: targetConversation,
        message: messageView,
      });
    }

    return jsonResponse({
      conversation: currentConversation,
      message: message ? toMessageView(message) : null,
    }, existingConversation ? 200 : 201);
  } catch (error) {
    return handleApiError(error);
  }
}
