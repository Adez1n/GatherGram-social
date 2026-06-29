import type { MessageWithSender } from "@/types/message";
import ReadReceipt from "@/components/messages/ReadReceipt";

type MessageBubbleProps = {
  message: MessageWithSender;
  own: boolean;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MessageBubble({ message, own }: MessageBubbleProps) {
  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-md px-4 py-3 ${
          own
            ? "bg-[#3DD9EB] text-[#0F1113]"
            : "border border-[#2E2E2E] bg-[#202020] text-[#F5F5F5]"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>
        <p
          className={`mt-2 text-[11px] font-bold ${
            own ? "text-[#0F1113]/70" : "text-[#A3A3A3]"
          }`}
        >
          {formatTime(message.createdAt)}
          {own ? (
            <>
              {" · "}
              <ReadReceipt
                read={message.read}
                pending={message.pending}
                failed={message.failed}
              />
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
