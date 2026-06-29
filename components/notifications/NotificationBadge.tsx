"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NotificationsResponse = {
  unreadCount?: number;
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("gathergram_user_id");
    const token = localStorage.getItem("gathergram_token");

    if (!userId && !token) {
      return;
    }

    let ignore = false;

    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/notifications", {
          headers: getAuthHeaders(),
        });
        const data = (await response.json()) as NotificationsResponse;

        if (!ignore && response.ok) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        if (!ignore) {
          setUnreadCount(0);
        }
      }
    }

    void loadUnreadCount();
    window.addEventListener("gathergram:notifications-updated", loadUnreadCount);

    return () => {
      ignore = true;
      window.removeEventListener(
        "gathergram:notifications-updated",
        loadUnreadCount,
      );
    };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label="Abrir notificaciones"
      className="relative grid h-11 w-11 place-items-center rounded-md border border-[#2E2E2E] bg-[#202020] text-[#F5F5F5] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3DD9EB]/50 hover:bg-[#2A2A2A] hover:text-[#3DD9EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD9EB]/70"
    >
      <i className="bi bi-bell-fill" aria-hidden="true" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#3DD9EB] px-1 text-[10px] font-black text-[#0F1113] ring-2 ring-[#181818]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
