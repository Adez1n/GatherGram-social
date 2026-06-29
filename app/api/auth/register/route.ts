import { type NextRequest } from "next/server";
import { errorResponse, handleApiError, jsonResponse } from "@/src/lib/api";
import { hashPassword, safeUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { registerSchema } from "@/src/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (existingUser) {
      return errorResponse("Email o username ya esta en uso", 409);
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name ?? body.username,
        username: body.username,
        passwordHash: await hashPassword(body.password),
        avatar: body.avatar,
        bio: body.bio,
      },
    });

    return jsonResponse({ user: safeUser(user) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
