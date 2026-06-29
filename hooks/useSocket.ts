"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("gathergram_token");
    const userId = localStorage.getItem("gathergram_user_id");

    if (!token && !userId) {
      return;
    }

    const socketInstance = io({
      auth: {
        token,
        userId,
      },
    });

    socketInstance.on("connect", () => setConnected(true));
    socketInstance.on("disconnect", () => setConnected(false));
    const setSocketTimer = window.setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    return () => {
      window.clearTimeout(setSocketTimer);
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}
