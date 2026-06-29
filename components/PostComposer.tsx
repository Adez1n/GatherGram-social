"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

const MAX_CONTENT_LENGTH = 280;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const EMOJIS = ["😀", "😂", "❤️", "🔥", "😭", "😎", "🙏", "💀", "🐐", "🎮", "🚀", "⭐"];

type MediaPreview = {
  url: string;
  type: "image" | "video";
  name: string;
};

type CreatePostResponse = {
  post?: {
    id: string;
    content: string;
  };
  error?: string;
  details?: Record<string, string[]>;
};

type PostComposerProps = {
  variant?: "inline" | "modal";
  onSuccess?: () => void;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export default function PostComposer({
  variant = "inline",
  onSuccess,
}: PostComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [location, setLocation] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedContent = content.trim();
  const trimmedDescription = description.trim();
  const isContentOverLimit = content.length > MAX_CONTENT_LENGTH;
  const isDescriptionOverLimit = description.length > MAX_DESCRIPTION_LENGTH;
  const isModal = variant === "modal";

  const canSubmit = useMemo(() => {
    return (
      trimmedContent.length > 0 &&
      !isContentOverLimit &&
      !isDescriptionOverLimit &&
      !isSubmitting
    );
  }, [
    isContentOverLimit,
    isDescriptionOverLimit,
    isSubmitting,
    trimmedContent.length,
  ]);

  async function handleMediaChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccessMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Solo puedes subir imagenes o videos.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("El archivo no puede superar 3 MB en esta demo.");
      event.target.value = "";
      return;
    }

    const mediaType = file.type.startsWith("image/") ? "image" : "video";
    const dataUrl = await readFileAsDataUrl(file);

    setMedia({
      url: dataUrl,
      type: mediaType,
      name: file.name,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!trimmedContent) {
      setError("Escribe algo antes de publicar.");
      return;
    }

    if (isContentOverLimit) {
      setError(`Tu post no puede superar ${MAX_CONTENT_LENGTH} caracteres.`);
      return;
    }

    if (isDescriptionOverLimit) {
      setError(
        `La descripcion no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres.`,
      );
      return;
    }

    const userId = localStorage.getItem("gathergram_user_id");
    const token = localStorage.getItem("gathergram_token");

    if (!userId && !token) {
      setError("Inicia sesion para poder publicar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content: trimmedContent,
          description: trimmedDescription || undefined,
          mediaUrl: media?.url,
          mediaType: media?.type,
          location: location.trim() || undefined,
        }),
      });

      const data = (await response.json()) as CreatePostResponse;

      if (!response.ok) {
        const zodMessage =
          data.details?.content?.[0] ??
          data.details?.description?.[0] ??
          data.details?.mediaUrl?.[0];
        setError(zodMessage ?? data.error ?? "No se pudo publicar el post.");
        return;
      }

      setContent("");
      setDescription("");
      setMedia(null);
      setLocation("");
      setSuccessMessage("Publicado correctamente.");
      router.refresh();
      onSuccess?.();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={isModal ? "space-y-4" : "space-y-0"}
      noValidate
    >
      {!isModal ? (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <i className="bi bi-pencil-square" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Crear publicacion</h2>
              <p className="text-xs font-medium text-[#8B949E]">
                Comparte algo con tu comunidad
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className={isModal ? "flex gap-3" : "px-4 pt-4"}>
        {isModal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/default-avatar.svg"
            alt="Avatar"
            className="mt-1 h-11 w-11 shrink-0 rounded-full border border-[#3DD9EB]/25 object-cover"
          />
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          <textarea
            id="create-post-content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError("");
              setSuccessMessage("");
            }}
            maxLength={MAX_CONTENT_LENGTH + 20}
            disabled={isSubmitting}
            placeholder={
              isModal ? "Que esta pasando?" : "Titulo o idea principal del post"
            }
            autoFocus={isModal}
            className={`w-full resize-none border-white/10 bg-white/[0.04] text-sm leading-6 text-white outline-none transition-all duration-200 placeholder:text-[#6B7280] hover:border-cyan-300/30 focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              isModal
                ? "min-h-28 border-0 bg-transparent px-0 py-2 text-lg focus:ring-0"
                : "min-h-20 rounded-2xl border px-4 py-3"
            }`}
          />

          <textarea
            id="create-post-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError("");
              setSuccessMessage("");
            }}
            maxLength={MAX_DESCRIPTION_LENGTH + 20}
            disabled={isSubmitting}
            placeholder="Agrega detalles, contexto o una descripcion breve"
            className={`w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition-all duration-200 placeholder:text-[#6B7280] hover:border-cyan-300/30 focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              isModal ? "min-h-16" : "min-h-16"
            }`}
          />
        </div>
      </div>

      {media ? (
        <div className={isModal ? "overflow-hidden rounded-2xl border border-white/10 bg-[#080A0B]" : "mx-4 mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#080A0B]"}>
          {media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt={media.name}
              className={isModal ? "max-h-64 w-full object-cover" : "max-h-72 w-full object-cover"}
            />
          ) : (
            <video
              src={media.url}
              controls
              className={isModal ? "max-h-64 w-full object-cover" : "max-h-72 w-full object-cover"}
            />
          )}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2">
            <p className="truncate text-xs font-medium text-[#A3A3A3]">
              {media.name}
            </p>
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="rounded-xl px-2 py-1 text-xs font-bold text-cyan-200 transition-colors duration-200 hover:bg-white/[0.06]"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : null}

      {isModal ? (
        <p className="border-b border-white/10 pb-3 text-sm font-bold text-cyan-200">
          <i className="bi bi-globe-americas mr-2" aria-hidden="true" />
          Todos pueden responder
        </p>
      ) : null}

      {showLocationInput ? (
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength={80}
          placeholder="Reynosa, Tamaulipas"
          className={isModal ? "h-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-[#6B7280] focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10" : "mx-4 mt-4 h-10 w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-[#6B7280] focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10"}
        />
      ) : location ? (
        <p className={isModal ? "rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200" : "mx-4 mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200"}>
          <i className="bi bi-geo-alt-fill mr-2" aria-hidden="true" />
          {location}
        </p>
      ) : null}

      {showEmojiPicker ? (
        <div className={isModal ? "grid grid-cols-6 gap-2 rounded-2xl border border-white/10 bg-[#0E1113] p-3" : "mx-4 mt-4 grid grid-cols-6 gap-2 rounded-2xl border border-white/10 bg-[#0E1113] p-3"}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setContent((current) => `${current}${emoji}`);
                setShowEmojiPicker(false);
              }}
              className="grid h-9 place-items-center rounded-xl text-lg transition-colors duration-200 hover:bg-white/[0.06]"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      <div className={isModal ? "flex flex-wrap items-center justify-between gap-3" : "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3"}>
        <div className="flex items-center gap-2">
          <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#A3A3A3] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              disabled={isSubmitting}
              className="sr-only"
            />
            <i className="bi bi-image" aria-hidden="true" />
            <span className="sr-only">Subir imagen o video</span>
          </label>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#A3A3A3] transition-colors duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            aria-label="Agregar encuesta"
          >
            <i className="bi bi-ui-checks" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#A3A3A3] transition-colors duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            aria-label="Agregar emoji"
          >
            <i className="bi bi-emoji-smile" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowLocationInput((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#A3A3A3] transition-colors duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            aria-label="Agregar ubicacion"
          >
            <i className="bi bi-geo-alt" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 text-xs font-bold sm:flex">
            <span
              className={
                isDescriptionOverLimit ? "text-[#55E6F7]" : "text-[#A3A3A3]"
              }
            >
              Desc. {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
            <span
              className={
                isContentOverLimit ? "text-[#55E6F7]" : "text-[#A3A3A3]"
              }
            >
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-300 text-sm font-black text-[#041012] shadow-lg shadow-cyan-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-cyan-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
              isModal ? "min-w-24 px-5" : "min-w-32 px-5"
            }`}
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F1113]/30 border-t-[#0F1113]" />
            ) : null}
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className={isModal ? "min-h-5" : "min-h-5 px-4 pb-4"}>
        {error ? (
          <p className="text-sm font-medium text-cyan-200">{error}</p>
        ) : null}
        {successMessage ? (
          <p className="text-sm font-medium text-cyan-200">
            {successMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
