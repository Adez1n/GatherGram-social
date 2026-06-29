import { type NextRequest } from "next/server";
import { handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const [currentUser, userCount] = await Promise.all([
      getCurrentUser(request),
      prisma.user.count(),
    ]);

    return jsonResponse({
      authenticated: Boolean(currentUser),
      hasUsers: userCount > 0,
      user: currentUser
        ? {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatar: currentUser.avatar,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
