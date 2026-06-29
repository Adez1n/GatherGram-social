import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { toChatUser } from "@/src/lib/messages";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const [following, followers] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      }),
      prisma.follow.findMany({
        where: { followingId: currentUser.id },
        select: { followerId: true },
      }),
    ]);

    const followingIds = new Set(following.map((item) => item.followingId));
    const mutualIds = followers
      .map((item) => item.followerId)
      .filter((followerId) => followingIds.has(followerId));

    const [mutualUsers, users] = await Promise.all([
      mutualIds.length > 0
        ? prisma.user.findMany({
            where: {
              id: { in: mutualIds },
            },
            orderBy: { username: "asc" },
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          })
        : [],
      prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      orderBy: { username: "asc" },
      take: 30,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
      },
      }),
    ]);

    return jsonResponse({
      mutualUsers: mutualUsers.map((user) => ({
        ...toChatUser(user),
        mutual: true,
      })),
      users: users.map((user) => ({
        ...toChatUser(user),
        mutual: mutualIds.includes(user.id),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
