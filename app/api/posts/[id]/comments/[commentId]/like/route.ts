import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type CommentLikeContext = RouteContext<"/api/posts/[id]/comments/[commentId]/like">;

async function getCommentLikeState(userId: string, commentId: string) {
  const [existingLike, likesCount] = await Promise.all([
    prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
      select: { id: true },
    }),
    prisma.commentLike.count({ where: { commentId } }),
  ]);

  return {
    liked: Boolean(existingLike),
    likesCount,
  };
}

export async function POST(request: NextRequest, context: CommentLikeContext) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId, commentId } = await context.params;
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
      select: { id: true },
    });

    if (!comment) {
      return errorResponse("Comentario no encontrado", 404);
    }

    await prisma.commentLike.upsert({
      where: {
        userId_commentId: {
          userId: currentUser.id,
          commentId,
        },
      },
      create: {
        userId: currentUser.id,
        commentId,
      },
      update: {},
    });

    return jsonResponse(await getCommentLikeState(currentUser.id, commentId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: CommentLikeContext) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId, commentId } = await context.params;
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
      select: { id: true },
    });

    if (!comment) {
      return errorResponse("Comentario no encontrado", 404);
    }

    await prisma.commentLike.deleteMany({
      where: {
        userId: currentUser.id,
        commentId,
      },
    });

    return jsonResponse(await getCommentLikeState(currentUser.id, commentId));
  } catch (error) {
    return handleApiError(error);
  }
}
