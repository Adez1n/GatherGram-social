"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthInput from "@/components/auth/auth-input";
import AuthSubmitButton from "@/components/auth/auth-submit-button";

const loginFormSchema = z.object({
  email: z.string().trim().email("Escribe un email valido").toLowerCase(),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  error?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: values.email,
        password: values.password,
      }),
    });

    const data = (await response.json()) as LoginResponse;

    if (!response.ok) {
      setServerError(data.error ?? "No se pudo iniciar sesion");
      return;
    }

    if (data.token) {
      localStorage.setItem("gathergram_token", data.token);
    }

    if (data.user?.id) {
      localStorage.setItem("gathergram_user_id", data.user.id);
    }

    if (data.user?.username) {
      localStorage.setItem("gathergram_username", data.user.username);
    }

    window.dispatchEvent(new Event("gathergram:auth-updated"));
    router.push("/");
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
        id="password"
        label="Contrasena"
        type="password"
        placeholder="Tu contrasena"
        autoComplete="current-password"
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
        idleText={isValid ? "Entrar a GatherGram" : "Completa tus datos"}
        loadingText="Entrando..."
      />
    </form>
  );
}
