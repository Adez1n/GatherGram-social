import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import {
  getConversationView,
  getParticipantUserIds,
  toMessageView,
} from "@/src/lib/messages";
import { emitToUser } from "@/src/lib/socket-server";
import { prisma } from "@/src/lib/prisma";
import { sendMessageSchema } from "@/src/lib/validations/message";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = sendMessageSchema.parse(await request.json());

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: body.conversationId,
          userId: currentUser.id,
        },
      },
      select: { id: true },
    });

    if (!participant) {
      return errorResponse("No perteneces a esta conversacion", 403);
    }

    const message = await prisma.message.create({
      data: {
        conversationId: body.conversationId,
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
      where: { id: body.conversationId },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    const participantUserIds = await getParticipantUserIds(body.conversationId);
    const messageView = toMessageView(message);

    await Promise.all(
      participantUserIds.map(async (participantUserId) => {
        const conversation = await getConversationView(
          body.conversationId,
          participantUserId,
        );

        if (!conversation) {
          return;
        }

        emitToUser(participantUserId, "message:new", {
          conversation,
          message: messageView,
        });
        emitToUser(participantUserId, "conversation:update", { conversation });
      }),
    );

    return jsonResponse({ message: messageView }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
