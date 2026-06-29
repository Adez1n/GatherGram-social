import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { createSession, safeUser, verifyPassword } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { loginSchema } from "@/src/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    const identifier = body.identifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: body.identifier }],
      },
    });

    if (!user) {
      return errorResponse("Credenciales invalidas", 401);
    }

    const isValidPassword = await verifyPassword(body.password, user.passwordHash);

    if (!isValidPassword) {
      return errorResponse("Credenciales invalidas", 401);
    }

    const session = await createSession(user.id);

    return jsonResponse({
      user: safeUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
