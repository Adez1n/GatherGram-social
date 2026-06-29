"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { OnlineStatusPayload } from "@/types/message";

export function useOnlineStatus(socket: Socket | null) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleOnline(payload: OnlineStatusPayload) {
      setOnlineUsers((current) => ({ ...current, [payload.userId]: true }));
    }

    function handleOffline(payload: OnlineStatusPayload) {
      setOnlineUsers((current) => ({ ...current, [payload.userId]: false }));
    }

    socket.on("online", handleOnline);
    socket.on("offline", handleOffline);

    return () => {
      socket.off("online", handleOnline);
      socket.off("offline", handleOffline);
    };
  }, [socket]);

  return onlineUsers;
}
