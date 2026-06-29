"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthInput from "@/components/auth/auth-input";
import AuthSubmitButton from "@/components/auth/auth-submit-button";

const registerFormSchema = z.object({
  email: z.string().trim().email("Escribe un email valido").toLowerCase(),
  name: z
    .string()
    .trim()
    .min(1, "Escribe tu nombre")
    .max(60, "El nombre no puede superar 60 caracteres"),
  username: z
    .string()
    .trim()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(24, "El username no puede superar 24 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Usa solo letras, numeros y guion bajo",
    ),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72, "La contrasena no puede superar 72 caracteres"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

type RegisterResponse = {
  user?: {
    id: string;
    email: string;
    username: string;
  };
  error?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      name: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as RegisterResponse;

    if (!response.ok) {
      setServerError(data.error ?? "No se pudo crear la cuenta");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AuthInput
        id="email"
        label="Email"
        type="email"
        placeholder="alan@gathergram.dev"
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthInput
        id="name"
        label="Nombre"
        type="text"
        placeholder="Alan"
        autoComplete="name"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <AuthInput
        id="username"
        label="Username"
        type="text"
        placeholder="alan_dev"
        autoComplete="username"
        disabled={isSubmitting}
        error={errors.username?.message}
        {...register("username")}
      />

      <AuthInput
        id="password"
        label="Contrasena"
        type="password"
        placeholder="Minimo 8 caracteres"
        autoComplete="new-password"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError ? (
        <div className="rounded-md border border-[#3DD9EB]/30 bg-[#3DD9EB]/5 px-4 py-3 text-sm font-medium text-[#55E6F7]">
          {serverError}
        </div>
      ) : null}

      <AuthSubmitButton
        isSubmitting={isSubmitting}
        idleText={isValid ? "Crear cuenta" : "Completa tus datos"}
        loadingText="Creando cuenta..."
      />
    </form>
  );
}
