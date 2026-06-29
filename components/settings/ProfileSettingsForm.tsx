"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import ImageEditModal from "@/components/settings/ImageEditModal";

type ProfileSettingsFormProps = {
  initialValues: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    banner: string;
    profileTextColor: string;
    profileAccentColor: string;
  };
};

type ImageField = "avatar" | "banner";

type ImageDraft = {
  type: ImageField;
  source: string;
};

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MIN_IMAGE_SIZE = {
  avatar: { width: 256, height: 256, label: "Avatar" },
  banner: { width: 900, height: 300, label: "Banner" },
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");
  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function getImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    image.src = src;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen editada"));
    reader.readAsDataURL(blob);
  });
}

export default function ProfileSettingsForm({
  initialValues,
}: ProfileSettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageDraft, setImageDraft] = useState<ImageDraft | null>(null);

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: ImageField,
  ) {
    setMessage("");
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Solo puedes subir imagenes o GIFs.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("La imagen no puede superar 8 MB en esta demo.");
      event.target.value = "";
      return;
    }

    try {
      const source = await readFileAsDataUrl(file);
      const isGif = file.type === "image/gif";

      if (!isGif) {
        const size = await getImageSize(source);
        const rules = MIN_IMAGE_SIZE[field];

        if (size.width < rules.width || size.height < rules.height) {
          setMessage(
            `${rules.label}: minimo ${rules.width}x${rules.height}px para evitar bugs.`,
          );
          event.target.value = "";
          return;
        }
      }

      setImageDraft({ type: field, source });
    } catch {
      setMessage("No se pudo preparar la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleEditedImage(result: Blob | string) {
    if (!imageDraft) {
      return;
    }

    try {
      const imageValue =
        typeof result === "string" ? result : await blobToDataUrl(result);

      setValues((current) => ({
        ...current,
        [imageDraft.type]: imageValue,
      }));
      setMessage(
        `${imageDraft.type === "avatar" ? "Avatar" : "Banner"} aplicado. Ahora guarda la personalizacion.`,
      );
      setImageDraft(null);
    } catch {
      setMessage("No se pudo aplicar la imagen editada.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        error?: string;
        user?: { username: string };
      };

      if (!response.ok) {
        setMessage(data.error ?? "No se pudo actualizar el perfil.");
        return;
      }

      if (data.user?.username) {
        localStorage.setItem("gathergram_username", data.user.username);
      }
      setMessage("Perfil actualizado.");
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="space-y-5 rounded-md border border-[#2E2E2E] bg-[#181818] p-5"
      >
        <div>
          <h1 className="text-2xl font-black text-[#F5F5F5]">
            Personalizar perfil
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Cambia avatar, banner animado y colores al estilo Discord.
          </p>
        </div>

        <section className="overflow-hidden rounded-md border border-[#2E2E2E] bg-[#101010]">
          <div
            className="h-36 bg-cover bg-center"
            style={{
              backgroundImage: values.banner
                ? `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.4)), url("${values.banner}")`
                : `linear-gradient(135deg, ${values.profileAccentColor}66, #101010 70%)`,
            }}
          />
          <div className="-mt-12 px-5 pb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.avatar || "/default-avatar.svg"}
              alt="Preview avatar"
              className="h-24 w-24 rounded-full border-4 bg-[#121212] object-cover"
              style={{ borderColor: values.profileAccentColor }}
            />
            <h2
              className="mt-3 text-2xl font-black"
              style={{ color: values.profileTextColor }}
            >
              {values.name || values.username || "Tu nombre"}
            </h2>
            <p className="text-sm text-[#A3A3A3]">
              @{values.username || "username"}
            </p>
            <p
              className="mt-2 text-sm"
              style={{ color: values.profileTextColor }}
            >
              {values.bio || "Tu bio aparecera aqui."}
            </p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
              Avatar o GIF
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event, "avatar")}
              className="block w-full text-sm text-[#A3A3A3] file:mr-3 file:rounded-md file:border-0 file:bg-[#3DD9EB] file:px-3 file:py-2 file:text-sm file:font-black file:text-[#0F1113]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
              Banner o GIF
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event, "banner")}
              className="block w-full text-sm text-[#A3A3A3] file:mr-3 file:rounded-md file:border-0 file:bg-[#3DD9EB] file:px-3 file:py-2 file:text-sm file:font-black file:text-[#0F1113]"
            />
          </label>
        </div>

        {(["name", "username"] as const).map((field) => (
          <label key={field} className="block">
            <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
              {field}
            </span>
            <input
              value={values[field]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
              className="h-11 w-full rounded-md border border-[#2E2E2E] bg-[#202020] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#3DD9EB]/80"
            />
          </label>
        ))}

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
            bio
          </span>
          <textarea
            value={values.bio}
            onChange={(event) =>
              setValues((current) => ({ ...current, bio: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border border-[#2E2E2E] bg-[#202020] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#3DD9EB]/80"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
              Color de letras
            </span>
            <input
              type="color"
              value={values.profileTextColor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  profileTextColor: event.target.value,
                }))
              }
              className="h-11 w-full rounded-md border border-[#2E2E2E] bg-[#202020] p-1"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#A3A3A3]">
              Color de acento
            </span>
            <input
              type="color"
              value={values.profileAccentColor}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  profileAccentColor: event.target.value,
                }))
              }
              className="h-11 w-full rounded-md border border-[#2E2E2E] bg-[#202020] p-1"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={values.avatar}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                avatar: event.target.value,
              }))
            }
            placeholder="URL de avatar o data URL"
            className="h-11 rounded-md border border-[#2E2E2E] bg-[#202020] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#3DD9EB]/80"
          />
          <input
            value={values.banner}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                banner: event.target.value,
              }))
            }
            placeholder="URL de banner o data URL"
            className="h-11 rounded-md border border-[#2E2E2E] bg-[#202020] px-3 text-sm text-[#F5F5F5] outline-none focus:border-[#3DD9EB]/80"
          />
        </div>

        {message ? (
          <p className="text-sm font-bold text-[#3DD9EB]">{message}</p>
        ) : null}
        <button
          disabled={loading}
          className="h-11 rounded-md bg-[#3DD9EB] px-5 text-sm font-black text-[#0F1113] disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar personalizacion"}
        </button>
      </form>

      {imageDraft ? (
        <ImageEditModal
          open
          imageSrc={imageDraft.source}
          type={imageDraft.type}
          onClose={() => setImageDraft(null)}
          onApply={(result) => {
            void handleEditedImage(result);
          }}
        />
      ) : null}
    </>
  );
}
