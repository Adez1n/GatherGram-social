import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { createNotificationIfNeeded } from "@/src/lib/notifications";
import { prisma } from "@/src/lib/prisma";
import { followSchema } from "@/src/lib/validators";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/users/[id]/follow">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return jsonResponse({ following: false });
    }

    const params = await context.params;
    const { userId: followingId } = followSchema.parse({ userId: params.id });

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId,
        },
      },
      select: {
        id: true,
      },
    });

    return jsonResponse({ following: Boolean(follow) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/users/[id]/follow">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { userId: followingId } = followSchema.parse({ userId: params.id });

    if (currentUser.id === followingId) {
      return errorResponse("No puedes seguirte a ti mismo", 400);
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return errorResponse("Usuario no encontrado", 404);
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId,
        },
      });
    }

    await createNotificationIfNeeded({
      type: "FOLLOW",
      userId: followingId,
      actorId: currentUser.id,
    });

    return jsonResponse({ following: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/users/[id]/follow">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { userId: followingId } = followSchema.parse({ userId: params.id });

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId,
      },
    });

    return jsonResponse({ following: false });
  } catch (error) {
    return handleApiError(error);
  }
}
