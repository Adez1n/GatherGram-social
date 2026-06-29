import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser, safeUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { updateProfileSchema } from "@/src/lib/validators";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = updateProfileSchema.parse(await request.json());

    if (body.username && body.username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: body.username },
        select: { id: true },
      });

      if (existingUser) {
        return errorResponse("Username ya esta en uso", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: body,
    });

    return jsonResponse({ user: safeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
