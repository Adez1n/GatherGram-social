import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { createNotificationIfNeeded } from "@/src/lib/notifications";
import { prisma } from "@/src/lib/prisma";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/like">,
) {
  try {
    const currentUser = await getCurrentUser(request);
    const { id: postId } = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    const [existingLike, likesCount] = await Promise.all([
      currentUser
        ? prisma.like.findUnique({
            where: {
              userId_postId: {
                userId: currentUser.id,
                postId,
              },
            },
            select: { id: true },
          })
        : null,
      prisma.like.count({ where: { postId } }),
    ]);

    return jsonResponse({
      liked: Boolean(existingLike),
      likesCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/like">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId } = await context.params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
    });

    if (!existingLike) {
      await prisma.like.create({
        data: {
          userId: currentUser.id,
          postId,
        },
      });
    }

    await createNotificationIfNeeded({
      type: "LIKE",
      userId: post.authorId,
      actorId: currentUser.id,
      postId: post.id,
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    return jsonResponse({ liked: true, likesCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/like">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId } = await context.params;

    await prisma.like.deleteMany({
      where: {
        userId: currentUser.id,
        postId,
      },
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    return jsonResponse({ liked: false, likesCount });
  } catch (error) {
    return handleApiError(error);
  }
}
