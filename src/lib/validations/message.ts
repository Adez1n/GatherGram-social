import { z } from "zod";

const uuidSchema = z.string().uuid("ID invalido");

export const createConversationSchema = z
  .object({
    targetUserId: uuidSchema,
    content: z.string().trim().min(1).max(2000).optional(),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    conversationId: uuidSchema,
    content: z.string().trim().min(1, "El mensaje no puede estar vacio").max(2000),
  })
  .strict();

export const getMessagesQuerySchema = z.object({
  cursor: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export const markAsReadSchema = z
  .object({
    conversationId: uuidSchema,
  })
  .strict();

export const typingSchema = z
  .object({
    conversationId: uuidSchema,
  })
  .strict();

export const conversationParamsSchema = z.object({
  conversationId: uuidSchema,
});
