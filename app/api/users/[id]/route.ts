import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { prisma } from "@/src/lib/prisma";
import { usernameParamSchema } from "@/src/lib/validators";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/users/[id]">,
) {
  try {
    const params = await context.params;
    const { username } = usernameParamSchema.parse({ username: params.id });

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        banner: true,
        profileTextColor: true,
        profileAccentColor: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse("Usuario no encontrado", 404);
    }

    return jsonResponse({
      id: user.id,
      username: user.username,
      name: user.name ?? user.username,
      bio: user.bio,
      avatar: user.avatar,
      banner: user.banner,
      profileTextColor: user.profileTextColor,
      profileAccentColor: user.profileAccentColor,
      createdAt: user.createdAt,
      followers: user._count.followers,
      following: user._count.following,
      posts: user._count.posts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
