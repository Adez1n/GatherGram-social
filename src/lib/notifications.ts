import { type NotificationType } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

type CreateNotificationInput = {
  type: NotificationType;
  userId: string;
  actorId: string;
  postId?: string | null;
  commentId?: string | null;
};

export async function createNotificationIfNeeded({
  type,
  userId,
  actorId,
  postId,
  commentId,
}: CreateNotificationInput) {
  if (userId === actorId) {
    return null;
  }

  if (type !== "COMMENT") {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type,
        userId,
        actorId,
        postId: postId ?? null,
        commentId: commentId ?? null,
      },
      select: {
        id: true,
      },
    });

    if (existingNotification) {
      return existingNotification;
    }
  }

  return prisma.notification.create({
    data: {
      type,
      userId,
      actorId,
      postId: postId ?? undefined,
      commentId: commentId ?? undefined,
    },
    select: {
      id: true,
    },
  });
}
