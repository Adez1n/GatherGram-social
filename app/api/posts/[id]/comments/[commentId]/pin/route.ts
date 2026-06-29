import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type CommentPinContext = RouteContext<"/api/posts/[id]/comments/[commentId]/pin">;

export async function PATCH(request: NextRequest, context: CommentPinContext) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId, commentId } = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    if (post.authorId !== currentUser.id) {
      return errorResponse("Solo el creador del post puede fijar comentarios", 403);
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        parentId: null,
      },
      select: {
        id: true,
        isPinned: true,
      },
    });

    if (!comment) {
      return errorResponse("Comentario no encontrado", 404);
    }

    if (comment.isPinned) {
      await prisma.comment.update({
        where: { id: comment.id },
        data: { isPinned: false },
      });

      return jsonResponse({ pinned: false, commentId: comment.id });
    }

    await prisma.$transaction([
      prisma.comment.updateMany({
        where: { postId },
        data: { isPinned: false },
      }),
      prisma.comment.update({
        where: { id: comment.id },
        data: { isPinned: true },
      }),
    ]);

    return jsonResponse({ pinned: true, commentId: comment.id });
  } catch (error) {
    return handleApiError(error);
  }
}
