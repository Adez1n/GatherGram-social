import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { getConversationView, getParticipantUserIds } from "@/src/lib/messages";
import { emitToUser } from "@/src/lib/socket-server";
import { prisma } from "@/src/lib/prisma";
import { markAsReadSchema } from "@/src/lib/validations/message";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = markAsReadSchema.parse(await request.json());

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

    await prisma.message.updateMany({
      where: {
        conversationId: body.conversationId,
        senderId: { not: currentUser.id },
        read: false,
      },
      data: { read: true },
    });

    const participantUserIds = await getParticipantUserIds(body.conversationId);

    await Promise.all(
      participantUserIds.map(async (participantUserId) => {
        emitToUser(participantUserId, "message:read", {
          conversationId: body.conversationId,
          readerId: currentUser.id,
        });

        const conversation = await getConversationView(
          body.conversationId,
          participantUserId,
        );

        if (conversation) {
          emitToUser(participantUserId, "conversation:update", { conversation });
        }
      }),
    );

    return jsonResponse({ read: true });
  } catch (error) {
    return handleApiError(error);
  }
}
