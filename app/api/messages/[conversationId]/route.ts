import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { toMessageView } from "@/src/lib/messages";
import { prisma } from "@/src/lib/prisma";
import {
  conversationParamsSchema,
  getMessagesQuerySchema,
} from "@/src/lib/validations/message";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/messages/[conversationId]">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { conversationId } = conversationParamsSchema.parse(params);
    const query = getMessagesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUser.id,
        },
      },
      select: { id: true },
    });

    if (!participant) {
      return errorResponse("No perteneces a esta conversacion", 403);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: query.limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
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

    const hasMore = messages.length > query.limit;
    const page = hasMore ? messages.slice(0, query.limit) : messages;
    const orderedMessages = page.reverse();

    return jsonResponse({
      messages: orderedMessages.map(toMessageView),
      nextCursor: hasMore ? page[page.length - 1]?.id : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
