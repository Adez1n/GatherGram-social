import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function validationError(error: ZodError) {
  return errorResponse("Datos invalidos", 400, error.flatten().fieldErrors);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse("El recurso ya existe", 409);
    }

    if (error.code === "P2025") {
      return errorResponse("Recurso no encontrado", 404);
    }
  }

  console.error(error);
  return errorResponse("Error interno del servidor", 500);
}
