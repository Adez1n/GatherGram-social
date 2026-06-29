import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { createNotificationIfNeeded } from "@/src/lib/notifications";
import { prisma } from "@/src/lib/prisma";
import { createCommentSchema, deleteCommentSchema } from "@/src/lib/validators";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/comments">,
) {
  try {
    const currentUser = await getCurrentUser(request);
    const { id: postId } = await context.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        text: true,
        parentId: true,
        isPinned: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return jsonResponse({
      comments: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        parentId: comment.parentId,
        isPinned: comment.isPinned,
        createdAt: comment.createdAt,
        author: comment.author,
        likesCount: comment._count.likes,
        liked: currentUser
          ? comment.likes.some((like) => like.userId === currentUser.id)
          : false,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/comments">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId } = await context.params;
    const body = createCommentSchema.parse(await request.json());
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    if (body.parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: body.parentId,
          postId,
          parentId: null,
        },
        select: { id: true },
      });

      if (!parentComment) {
        return errorResponse("Comentario padre no encontrado", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: body.text,
        postId,
        authorId: currentUser.id,
        parentId: body.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    await createNotificationIfNeeded({
      type: "COMMENT",
      userId: post.authorId,
      actorId: currentUser.id,
      postId: post.id,
      commentId: comment.id,
    });

    return jsonResponse({
      comment: {
        id: comment.id,
        text: comment.text,
        parentId: comment.parentId,
        isPinned: comment.isPinned,
        createdAt: comment.createdAt,
        author: comment.author,
        likesCount: comment._count.likes,
        liked: false,
      },
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/comments">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id: postId } = await context.params;
    const body = deleteCommentSchema.parse(await request.json());
    const comment = await prisma.comment.findFirst({
      where: {
        id: body.commentId,
        postId,
      },
    });

    if (!comment) {
      return errorResponse("Comentario no encontrado", 404);
    }

    if (comment.authorId !== currentUser.id) {
      return errorResponse("No puedes eliminar este comentario", 401);
    }

    await prisma.comment.delete({ where: { id: comment.id } });

    return jsonResponse({ message: "Comentario eliminado" });
  } catch (error) {
    return handleApiError(error);
  }
}
