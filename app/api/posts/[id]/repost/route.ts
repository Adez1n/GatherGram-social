import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

async function getRepostState(postId: string, userId?: string) {
  const [repostsCount, repost] = await Promise.all([
    prisma.repost.count({ where: { postId } }),
    userId
      ? prisma.repost.findUnique({
          where: { userId_postId: { userId, postId } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    reposted: Boolean(repost),
    repostsCount,
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/repost">,
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(request);

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    return jsonResponse(await getRepostState(id, currentUser?.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/repost">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return errorResponse("Post no encontrado", 404);
    }

    await prisma.repost.upsert({
      where: { userId_postId: { userId: currentUser.id, postId: id } },
      update: {},
      create: { userId: currentUser.id, postId: id },
    });

    return jsonResponse(await getRepostState(id, currentUser.id), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/posts/[id]/repost">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const { id } = await context.params;

    await prisma.repost.deleteMany({
      where: { userId: currentUser.id, postId: id },
    });

    return jsonResponse(await getRepostState(id, currentUser.id));
  } catch (error) {
    return handleApiError(error);
  }
}
