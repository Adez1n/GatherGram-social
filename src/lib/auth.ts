import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { type NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";

const SALT_ROUNDS = 12;
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function safeUser<T extends { passwordHash?: string }>(user: T) {
  const rest = { ...user };
  delete rest.passwordHash;
  return rest;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  return prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

export async function getCurrentUser(request: NextRequest) {
  // Dev shortcut: send x-user-id while the app does not have full auth yet.
  const devUserId = request.headers.get("x-user-id");

  if (devUserId) {
    return prisma.user.findUnique({ where: { id: devUserId } });
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function getUserFromSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}
