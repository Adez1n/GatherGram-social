"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthStatus = {
  authenticated: boolean;
  hasUsers: boolean;
};

function clearStoredAuth() {
  localStorage.removeItem("gathergram_token");
  localStorage.removeItem("gathergram_user_id");
  localStorage.removeItem("gathergram_username");
}

function getAuthHeaders() {
  const headers = new Headers();
  const token = localStorage.getItem("gathergram_token");
  const userId = localStorage.getItem("gathergram_user_id");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (userId) {
    headers.set("x-user-id", userId);
  }

  return headers;
}

export default function AuthFlowGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ignored = false;

    async function syncAuthFlow() {
      try {
        const response = await fetch("/api/auth/status", {
          headers: getAuthHeaders(),
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const status = (await response.json()) as AuthStatus;

        if (ignored) {
          return;
        }

        const isLoginPage = pathname.startsWith("/login");
        const isRegisterPage = pathname.startsWith("/register");
        const isLandingPage = pathname === "/";

        if (!status.hasUsers) {
          clearStoredAuth();

          if (!isRegisterPage) {
            router.replace("/register");
          }

          return;
        }

        if (status.authenticated) {
          if (isLoginPage || isRegisterPage) {
            router.replace("/");
          }

          return;
        }

        clearStoredAuth();

        if (!isLoginPage && !isRegisterPage && !isLandingPage) {
          router.replace("/login");
        }
      } catch {
        // Keep the current page if the status endpoint is temporarily unavailable.
      }
    }

    void syncAuthFlow();

    return () => {
      ignored = true;
    };
  }, [pathname, router]);

  return null;
}
