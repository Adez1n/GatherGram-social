"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageProfileButtonProps = {
  targetUserId: string;
};

type CreateConversationResponse = {
  conversation?: {
    id: string;
  };
  error?: string;
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function MessageProfileButton({
  targetUserId,
}: MessageProfileButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");

    const currentUserId = localStorage.getItem("gathergram_user_id");
    const token = localStorage.getItem("gathergram_token");

    if (!currentUserId && !token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = (await response.json()) as CreateConversationResponse;

      if (!response.ok || !data.conversation) {
        setError(data.error ?? "No se pudo abrir el chat.");
        return;
      }

      router.push(`/messages?conversation=${data.conversation.id}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="h-11 rounded-md border border-[#3DD9EB]/50 px-5 text-sm font-black text-[#55E6F7] transition-colors duration-200 hover:bg-[#3DD9EB]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD9EB]/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Abriendo..." : "Mensaje"}
      </button>
      {error ? <span className="text-xs font-bold text-[#55E6F7]">{error}</span> : null}
    </span>
  );
}
