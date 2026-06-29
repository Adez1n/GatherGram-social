import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        post: {
          select: {
            id: true,
            content: true,
            description: true,
            imageUrl: true,
            mediaUrl: true,
            mediaType: true,
            location: true,
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
              select: { likes: true, comments: true },
            },
          },
        },
      },
    });

    return jsonResponse({ posts: savedPosts.map((item) => item.post) });
  } catch (error) {
    return handleApiError(error);
  }
}
