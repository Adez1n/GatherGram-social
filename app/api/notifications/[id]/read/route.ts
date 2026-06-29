import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { notificationIdSchema } from "@/src/lib/validators";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/notifications/[id]/read">,
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const params = await context.params;
    const { id } = notificationIdSchema.parse(params);

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!notification) {
      return errorResponse("Notificacion no encontrada", 404);
    }

    if (notification.userId !== currentUser.id) {
      return errorResponse("No puedes modificar esta notificacion", 403);
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
      select: { id: true },
    });

    return jsonResponse({ read: true });
  } catch (error) {
    return handleApiError(error);
  }
}
