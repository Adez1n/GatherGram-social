import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createPostSchema } from "@/src/lib/validators";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
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

    return jsonResponse({ posts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = createPostSchema.parse(await request.json());

    const post = await prisma.post.create({
      data: {
        content: body.content,
        description: body.description,
        imageUrl: body.imageUrl ?? (body.mediaType === "image" ? body.mediaUrl : undefined),
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        location: body.location,
        authorId: currentUser.id,
      },
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

    return jsonResponse({ post }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
