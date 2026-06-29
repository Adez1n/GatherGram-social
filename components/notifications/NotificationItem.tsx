"use client";

export type NotificationView = {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  post: {
    id: string;
    content: string;
  } | null;
  comment: {
    id: string;
    content: string;
  } | null;
};

type NotificationItemProps = {
  notification: NotificationView;
  onMarkRead: (id: string) => void;
};

function getNotificationText(notification: NotificationView) {
  const actorName = notification.actor.name;

  if (notification.type === "LIKE") {
    return `${actorName} le dio like a tu publicacion.`;
  }

  if (notification.type === "COMMENT") {
    return `${actorName} comento en tu publicacion.`;
  }

  return `${actorName} empezo a seguirte.`;
}

function getRelativeDate(value: string) {
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "Ahora";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} d`;
  }

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getIcon(type: NotificationView["type"]) {
  if (type === "LIKE") {
    return "bi-heart-fill";
  }

  if (type === "COMMENT") {
    return "bi-chat-left-text-fill";
  }

  return "bi-person-plus-fill";
}

export default function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  return (
    <article
      className={`group rounded-md border p-4 shadow-2xl shadow-black/10 transition-colors duration-200 ${
        notification.read
          ? "border-[#2E2E2E] bg-[#181818]"
          : "border-[#3DD9EB]/30 bg-[#3DD9EB]/[0.07]"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={notification.actor.avatar || "/default-avatar.svg"}
            alt={`Avatar de ${notification.actor.name}`}
            className="h-12 w-12 rounded-full border border-[#3DD9EB]/25 object-cover"
          />
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-[#181818] bg-[#3DD9EB] text-xs text-[#0F1113]">
            <i className={`bi ${getIcon(notification.type)}`} aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-6 text-[#F5F5F5]">
                {getNotificationText(notification)}
              </p>
              <p className="truncate text-xs font-medium text-[#A3A3A3]">
                @{notification.actor.username} · {getRelativeDate(notification.createdAt)}
              </p>
            </div>

            {!notification.read ? (
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#3DD9EB] shadow-[0_0_14px_rgba(61,217,235,0.8)]"
                aria-label="No leida"
              />
            ) : null}
          </div>

          {notification.post ? (
            <p className="mt-3 truncate rounded-md border border-[#2E2E2E] bg-[#202020] px-3 py-2 text-xs text-[#A3A3A3]">
              {notification.post.content}
            </p>
          ) : null}

          {notification.comment ? (
            <p className="mt-2 truncate text-xs text-[#A3A3A3]">
              Comentario: {notification.comment.content}
            </p>
          ) : null}

          {!notification.read ? (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              className="mt-3 rounded-md px-3 py-2 text-xs font-black text-[#55E6F7] transition-colors duration-200 hover:bg-[#2A2A2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD9EB]/70"
            >
              Marcar como leida
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
