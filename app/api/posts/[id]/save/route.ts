import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { savePostSchema } from "@/src/lib/validators";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/save">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { postId } = savePostSchema.parse({ postId: params.id });
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    await prisma.savedPost.upsert({
      where: { userId_postId: { userId: currentUser.id, postId } },
      update: {},
      create: { userId: currentUser.id, postId },
    });

    return jsonResponse({ saved: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/save">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { postId } = savePostSchema.parse({ postId: params.id });

    await prisma.savedPost.deleteMany({
      where: { userId: currentUser.id, postId },
    });

    return jsonResponse({ saved: false });
  } catch (error) {
    return handleApiError(error);
  }
}
