"use client";

import { useEffect, useState } from "react";
import EmptyNotifications from "@/components/notifications/EmptyNotifications";
import NotificationItem, {
  type NotificationView,
} from "@/components/notifications/NotificationItem";

type NotificationsResponse = {
  notifications?: NotificationView[];
  unreadCount?: number;
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

export default function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationView[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as NotificationsResponse;

      if (ignore) {
        return;
      }

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudieron cargar las notificaciones.");
        return;
      }

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      if (!ignore) {
        setFeedback("No se pudo conectar con el servidor.");
      }
    } finally {
      if (!ignore) {
        setIsLoading(false);
      }
    }
  }

    void loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  async function markRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setFeedback(data.error ?? "No se pudo marcar como leida.");
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    }
  }

  async function markAllRead() {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setFeedback(data.error ?? "No se pudieron marcar como leidas.");
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );
      setUnreadCount(0);
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    }
  }

  return (
    <section className="space-y-4">
      <div className="gg-card rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">
              Notificaciones
            </h1>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : "Todo esta al dia"}
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-10 rounded-2xl border border-cyan-300/40 px-4 text-sm font-black text-cyan-200 transition-colors duration-200 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marcar todas
          </button>
        </div>

        {feedback ? (
          <p className="mt-4 text-sm font-medium text-cyan-200">{feedback}</p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="gg-card rounded-3xl p-6 text-sm font-bold text-[#A3A3A3]">
          Cargando notificaciones...
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={markRead}
            />
          ))}
        </div>
      ) : (
        <EmptyNotifications />
      )}
    </section>
  );
}
