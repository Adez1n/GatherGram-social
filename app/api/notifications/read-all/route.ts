import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return jsonResponse({ read: true, count: result.count });
  } catch (error) {
    return handleApiError(error);
  }
}
