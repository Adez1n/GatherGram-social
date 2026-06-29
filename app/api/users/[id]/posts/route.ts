import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { prisma } from "@/src/lib/prisma";
import { usernameParamSchema } from "@/src/lib/validators";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/users/[id]/posts">,
) {
  try {
    const params = await context.params;
    const { username } = usernameParamSchema.parse({ username: params.id });

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return errorResponse("Usuario no encontrado", 404);
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        description: true,
        imageUrl: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
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
            comments: true,
            likes: true,
          },
        },
      },
    });

    return jsonResponse({ posts });
  } catch (error) {
    return handleApiError(error);
  }
}
