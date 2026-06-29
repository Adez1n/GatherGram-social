import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Debe ser una URL valida")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalMediaSchema = z
  .string()
  .trim()
  .max(5_000_000, "El archivo es demasiado grande para esta demo")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalImageAssetSchema = z
  .string()
  .trim()
  .max(12_000_000, "La imagen es demasiado grande para esta demo")
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\/.+/i.test(value) ||
      /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value),
    "Debe ser una URL o imagen valida",
  )
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const registerSchema = z.object({
  email: z.string().trim().email("Email invalido").toLowerCase(),
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(60, "El nombre no puede superar 60 caracteres")
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(24, "El username no puede superar 24 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El username solo puede usar letras, numeros y guion bajo",
    ),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72, "La contrasena no puede superar 72 caracteres"),
  avatar: optionalImageAssetSchema,
  bio: z.string().trim().max(160, "La bio no puede superar 160 caracteres").optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email o username requerido"),
  password: z.string().min(1, "Contrasena requerida"),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El contenido es obligatorio")
    .max(280, "El contenido no puede superar 280 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "La descripcion no puede superar 500 caracteres")
    .optional(),
  imageUrl: optionalUrlSchema,
  mediaUrl: optionalMediaSchema,
  mediaType: z.enum(["image", "video"]).optional(),
  location: z
    .string()
    .trim()
    .max(80, "La ubicacion no puede superar 80 caracteres")
    .optional(),
});

export const updatePostSchema = z.object({
  content: z.string().trim().min(1).max(280).optional(),
  description: z.string().trim().max(500).optional(),
  imageUrl: optionalUrlSchema,
  mediaUrl: optionalMediaSchema,
  mediaType: z.enum(["image", "video"]).optional(),
  location: z.string().trim().max(80).optional(),
});

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, "El comentario es obligatorio").max(500),
  parentId: z.string().uuid("ID de comentario invalido").optional(),
});

export const followSchema = z.object({
  userId: z.string().uuid("ID de usuario invalido"),
});

export const notificationIdSchema = z.object({
  id: z.string().uuid("ID de notificacion invalido"),
});

export const notificationTypeSchema = z.enum(["LIKE", "COMMENT", "FOLLOW"]);

export const searchSchema = z.object({
  q: z.string().trim().max(80).default(""),
  type: z.enum(["all", "users", "posts", "hashtags"]).default("all"),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(24)
      .regex(/^[a-zA-Z0-9_]+$/, "Username invalido")
      .optional(),
    bio: z.string().trim().max(160).optional(),
    avatar: optionalImageAssetSchema,
    banner: optionalImageAssetSchema,
    profileTextColor: optionalColorSchema,
    profileAccentColor: optionalColorSchema,
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contrasena actual requerida"),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export const savePostSchema = z.object({
  postId: z.string().uuid("ID de post invalido"),
});

export const suggestionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export const usernameParamSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username invalido")
    .max(24, "Username invalido")
    .regex(/^[a-zA-Z0-9_]+$/, "Username invalido"),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid("ID de comentario invalido"),
});
