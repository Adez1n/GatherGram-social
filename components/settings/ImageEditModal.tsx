"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ImageEditModalProps = {
  open: boolean;
  imageSrc: string;
  type: "avatar" | "banner";
  onClose: () => void;
  onApply: (result: Blob | string) => void;
};

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

const IMAGE_CONFIG = {
  avatar: {
    label: "Avatar",
    width: 512,
    height: 512,
    aspectLabel: "1:1",
    outputType: "image/webp",
    quality: 0.92,
  },
  banner: {
    label: "Banner",
    width: 1920,
    height: 640,
    aspectLabel: "3:1",
    outputType: "image/jpeg",
    quality: 0.82,
  },
};

function readImageSize(src: string) {
  return new Promise<Size>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    image.src = src;
  });
}

function isAnimatedGif(src: string) {
  return src.startsWith("data:image/gif");
}

function clampPosition(
  position: Position,
  containerSize: Size,
  imageSize: Size | null,
  zoom: number,
) {
  if (!imageSize || containerSize.width === 0 || containerSize.height === 0) {
    return { x: 0, y: 0 };
  }

  const baseScale = Math.max(
    containerSize.width / imageSize.width,
    containerSize.height / imageSize.height,
  );
  const displayedWidth = imageSize.width * baseScale * zoom;
  const displayedHeight = imageSize.height * baseScale * zoom;
  const maxX = Math.max(0, (displayedWidth - containerSize.width) / 2);
  const maxY = Math.max(0, (displayedHeight - containerSize.height) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, position.x)),
    y: Math.min(maxY, Math.max(-maxY, position.y)),
  };
}

function cropVisibleAreaToDataUrl(
  src: string,
  imageSize: Size,
  containerSize: Size,
  position: Position,
  zoom: number,
  outputWidth: number,
  outputHeight: number,
  outputType: string,
  quality: number,
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("No se pudo preparar el editor"));
        return;
      }

      const baseScale = Math.max(
        containerSize.width / imageSize.width,
        containerSize.height / imageSize.height,
      );
      const scale = baseScale * zoom;
      const displayedWidth = imageSize.width * scale;
      const displayedHeight = imageSize.height * scale;
      const left = (containerSize.width - displayedWidth) / 2 + position.x;
      const top = (containerSize.height - displayedHeight) / 2 + position.y;

      const sourceX = Math.max(0, -left / scale);
      const sourceY = Math.max(0, -top / scale);
      const sourceWidth = Math.min(imageSize.width - sourceX, containerSize.width / scale);
      const sourceHeight = Math.min(imageSize.height - sourceY, containerSize.height / scale);

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      resolve(canvas.toDataURL(outputType, quality));
    };

    image.onerror = () => reject(new Error("No se pudo recortar la imagen"));
    image.src = src;
  });
}

export default function ImageEditModal({
  open,
  imageSrc,
  type,
  onClose,
  onApply,
}: ImageEditModalProps) {
  const config = IMAGE_CONFIG[type];
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosition: Position;
  } | null>(null);
  const [imageSize, setImageSize] = useState<Size | null>(null);
  const [containerSize, setContainerSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const gifMode = useMemo(() => isAnimatedGif(imageSrc), [imageSrc]);
  const clampedPosition = useMemo(
    () => clampPosition(position, containerSize, imageSize, zoom),
    [containerSize, imageSize, position, zoom],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let ignore = false;

    async function loadSize() {
      try {
        const nextSize = await readImageSize(imageSrc);

        if (!ignore) {
          setImageSize(nextSize);
        }
      } catch {
        if (!ignore) {
          setError("No se pudo cargar la imagen.");
        }
      }
    }

    void loadSize();

    return () => {
      ignore = true;
    };
  }, [imageSrc, open]);

  useEffect(() => {
    if (!open || !previewRef.current) {
      return;
    }

    const element = previewRef.current;
    const updateSize = () => {
      setContainerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };
    const observer = new ResizeObserver(updateSize);

    updateSize();
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [open, type]);

  if (!open) {
    return null;
  }

  function resetEditor() {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setError("");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (gifMode) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: clampedPosition,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const nextPosition = {
      x: drag.startPosition.x + event.clientX - drag.startX,
      y: drag.startPosition.y + event.clientY - drag.startY,
    };

    setPosition(clampPosition(nextPosition, containerSize, imageSize, zoom));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  async function handleApply() {
    setError("");
    setIsApplying(true);

    if (gifMode) {
      onApply(imageSrc);
      setIsApplying(false);
      onClose();
      return;
    }

    if (!imageSize || containerSize.width === 0 || containerSize.height === 0) {
      setError("Espera a que cargue la imagen antes de aplicar.");
      setIsApplying(false);
      return;
    }

    try {
      const result = await cropVisibleAreaToDataUrl(
        imageSrc,
        imageSize,
        containerSize,
        clampedPosition,
        zoom,
        config.width,
        config.height,
        config.outputType,
        config.quality,
      );

      onApply(result);
      onClose();
    } catch {
      setError("No se pudo aplicar el recorte.");
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="w-full max-w-[520px] rounded-xl border border-[#2B2D31] bg-[#1E1F22] p-5 shadow-2xl shadow-black/70 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#F2F3F5]">
              Editar imagen
            </h2>
            <p className="mt-1 text-sm font-bold text-[#A3A7AE]">
              {config.label} - {config.width}x{config.height}px
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-2xl font-bold text-[#B5BAC1] hover:bg-[#2B2D31] hover:text-[#F2F3F5]"
            aria-label="Cerrar editor"
          >
            &times;
          </button>
        </div>

        <div className="mt-6 rounded-md bg-[#111214] p-3">
          <div
            ref={previewRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative mx-auto overflow-hidden bg-[#111214] touch-none ${
              type === "avatar"
                ? "aspect-square max-w-[340px] cursor-grab active:cursor-grabbing"
                : "aspect-[3/1] w-full cursor-grab active:cursor-grabbing"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Imagen a editar"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none select-none object-contain"
              style={{
                width: imageSize
                  ? `${imageSize.width * Math.max(containerSize.width / imageSize.width, containerSize.height / imageSize.height) * zoom}px`
                  : "100%",
                height: imageSize
                  ? `${imageSize.height * Math.max(containerSize.width / imageSize.width, containerSize.height / imageSize.height) * zoom}px`
                  : "100%",
                transform: `translate(calc(-50% + ${clampedPosition.x}px), calc(-50% + ${clampedPosition.y}px))`,
              }}
            />

            {type === "avatar" ? (
              <div className="pointer-events-none absolute inset-[9%] rounded-full border-[5px] border-white shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            ) : (
              <div className="pointer-events-none absolute inset-0 border-[3px] border-white/90 shadow-[inset_0_0_0_999px_rgba(255,255,255,0.02)]" />
            )}
          </div>
        </div>

        {gifMode ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-md border border-[#3DD9EB]/50 bg-[#15383D] px-3 py-2 text-sm font-bold text-[#55E6F7]">
              Los GIFs animados se mantienen originales para no perder la
              animacion. GatherGram los ajustara automaticamente al{" "}
              {type === "avatar" ? "circulo del perfil" : "banner"}.
            </p>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3 text-[#A3A7AE]">
            <i className="bi bi-image text-sm" aria-hidden="true" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={zoom}
              onChange={(event) => {
                const nextZoom = Number(event.target.value);
                setZoom(nextZoom);
                setPosition((current) =>
                  clampPosition(current, containerSize, imageSize, nextZoom),
                );
              }}
              className="min-w-0 flex-1 accent-[#5865F2]"
              aria-label="Zoom de imagen"
            />
            <i className="bi bi-image-fill text-xl" aria-hidden="true" />
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-md border border-red-400/50 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetEditor}
            disabled={isApplying}
            className="text-sm font-black text-[#8EA1E1] hover:text-[#BAC8FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Restablecer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="h-11 rounded-md border border-[#3A3C43] bg-[#2B2D31] px-5 text-sm font-black text-[#F2F3F5] hover:bg-[#35373C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                void handleApply();
              }}
              disabled={isApplying}
              className="h-11 rounded-md bg-[#5865F2] px-6 text-sm font-black text-white hover:bg-[#6874FF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApplying ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
