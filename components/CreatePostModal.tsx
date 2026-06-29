"use client";

import { useEffect, useState } from "react";
import PostComposer from "@/components/PostComposer";

export default function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function openModal() {
      setIsOpen(true);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("gathergram:open-create-post", openModal);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("gathergram:open-create-post", openModal);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/75 px-4 py-8 backdrop-blur-md sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-label="Crear publicacion"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <section className="gg-fade-up w-full max-w-[620px] overflow-hidden rounded-3xl border border-white/10 bg-[#0E1113]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-2xl text-white transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>

          <p className="text-sm font-black text-cyan-200">Drafts</p>
        </header>

        <div className="p-4">
          <PostComposer variant="modal" onSuccess={() => setIsOpen(false)} />
        </div>
      </section>
    </div>
  );
}
