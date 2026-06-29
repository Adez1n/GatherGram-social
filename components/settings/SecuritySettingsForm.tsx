"use client";

import { useState } from "react";

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");
  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function SecuritySettingsForm() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      setMessage(response.ok ? data.message ?? "Contrasena actualizada." : data.error ?? "No se pudo actualizar.");
      if (response.ok) {
        setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border border-[#2E2E2E] bg-[#181818] p-5">
      <h1 className="text-2xl font-black text-[#F5F5F5]">Seguridad</h1>
      {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
        <label key={field} className="block">
          <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">{field}</span>
          <input
            type="password"
            value={values[field]}
            onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
            className="h-11 w-full rounded-md border border-[#2E2E2E] bg-[#202020] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#3DD9EB]/80"
          />
        </label>
      ))}
      {message ? <p className="text-sm font-bold text-[#3DD9EB]">{message}</p> : null}
      <button disabled={loading} className="h-11 rounded-md bg-[#3DD9EB] px-5 text-sm font-black text-[#0F1113] disabled:opacity-60">
        {loading ? "Guardando..." : "Cambiar contrasena"}
      </button>
    </form>
  );
}
