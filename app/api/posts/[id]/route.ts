import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { updatePostSchema } from "@/src/lib/validators";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/posts/[id]">,
) {
  try {
    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    return jsonResponse({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id } = await context.params;
    const body = updatePostSchema.parse(await request.json());

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    if (post.authorId !== currentUser.id) {
      return errorResponse("No puedes editar este post", 401);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: body,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return jsonResponse({ post: updatedPost });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id } = await context.params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    if (post.authorId !== currentUser.id) {
      return errorResponse("No puedes eliminar este post", 401);
    }

    await prisma.post.delete({ where: { id } });

    return jsonResponse({ message: "Post eliminado" });
  } catch (error) {
    return handleApiError(error);
  }
}
