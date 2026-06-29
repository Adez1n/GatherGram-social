import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const [notifications, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: {
          userId: currentUser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          id: true,
          type: true,
          read: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
            },
          },
          comment: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId: currentUser.id,
          read: false,
        },
      }),
    ]);

    return jsonResponse({
      unreadCount,
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        actor: {
          id: notification.actor.id,
          name: notification.actor.name ?? notification.actor.username,
          username: notification.actor.username,
          avatar: notification.actor.avatar,
        },
        post: notification.post,
        comment: notification.comment
          ? {
              id: notification.comment.id,
              content: notification.comment.text,
            }
          : null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
