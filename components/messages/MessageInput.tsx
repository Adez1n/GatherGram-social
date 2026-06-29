"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  disabled?: boolean;
};

export default function MessageInput({
  onSend,
  onTyping,
  disabled,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function submit() {
    const trimmedContent = content.trim();

    if (!trimmedContent || isSending) {
      return;
    }

    setIsSending(true);
    setContent("");

    try {
      await onSend(trimmedContent);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <footer className="border-t border-[#2E2E2E] p-4">
      <div className="flex items-end gap-3 rounded-md border border-[#2E2E2E] bg-[#202020] p-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder="Escribe un mensaje"
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#F5F5F5] outline-none placeholder:text-[#6B7280]"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!content.trim() || disabled || isSending}
          className="grid h-10 w-10 place-items-center rounded-md bg-[#3DD9EB] text-[#0F1113] transition-colors duration-200 hover:bg-[#55E6F7] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Enviar"
        >
          <i className="bi bi-send-fill" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
