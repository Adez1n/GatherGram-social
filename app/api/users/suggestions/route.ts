import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { suggestionsSchema } from "@/src/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const query = suggestionsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });
    const excludedIds = [currentUser.id, ...following.map((item) => item.followingId)];

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
      },
      orderBy: { createdAt: "desc" },
      take: query.limit,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        _count: {
          select: { followers: true },
        },
      },
    });

    return jsonResponse({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name ?? user.username,
        avatar: user.avatar,
        followersCount: user._count.followers,
        following: false,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
