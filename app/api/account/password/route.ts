import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { getCurrentUser, hashPassword, verifyPassword } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { updatePasswordSchema } from "@/src/lib/validators";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse("No autorizado", 401);
    }

    const body = updatePasswordSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });

    if (!user?.passwordHash) {
      return errorResponse("Esta cuenta no tiene contrasena local", 400);
    }

    const validPassword = await verifyPassword(
      body.currentPassword,
      user.passwordHash,
    );

    if (!validPassword) {
      return errorResponse("Contrasena actual incorrecta", 400);
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: await hashPassword(body.newPassword) },
      select: { id: true },
    });

    return jsonResponse({ message: "Contrasena actualizada" });
  } catch (error) {
    return handleApiError(error);
  }
}
