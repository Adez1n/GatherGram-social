import { randomUUID } from "crypto";
import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

async function getRepostState(postId: string, userId?: string) {
  const [countRows, repostRows] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(*) AS count FROM Repost WHERE postId = ${postId}
    `,
    userId
      ? prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM Repost WHERE userId = ${userId} AND postId = ${postId} LIMIT 1
        `
      : Promise.resolve([]),
  ]);

  return {
    reposted: repostRows.length > 0,
    repostsCount: Number(countRows[0]?.count ?? 0),
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

    await prisma.$executeRaw`
      INSERT OR IGNORE INTO Repost (id, userId, postId, createdAt)
      VALUES (${randomUUID()}, ${currentUser.id}, ${id}, CURRENT_TIMESTAMP)
    `;

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

    await prisma.$executeRaw`
      DELETE FROM Repost WHERE userId = ${currentUser.id} AND postId = ${id}
    `;

    return jsonResponse(await getRepostState(id, currentUser.id));
  } catch (error) {
    return handleApiError(error);
  }
}
