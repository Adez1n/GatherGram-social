"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import MessageProfileButton from "@/components/profile/MessageProfileButton";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileStats from "@/components/profile/ProfileStats";

type ProfileHeaderProps = {
  profile: {
    id: string;
    username: string;
    name: string;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    profileTextColor: string | null;
    profileAccentColor: string | null;
    createdAt: string;
    followers: number;
    following: number;
    posts: number;
  };
};

function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {};
  }

  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("gathergram:auth-updated", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("gathergram:auth-updated", onStoreChange);
  };
}

function getCurrentUserIdSnapshot() {
  return localStorage.getItem("gathergram_user_id");
}

function getServerCurrentUserIdSnapshot() {
  return null;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getCurrentUserIdSnapshot,
    getServerCurrentUserIdSnapshot,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [following, setFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [message, setMessage] = useState("");

  const isOwnProfile = isAuthLoaded && currentUserId === profile.id;

  useEffect(() => {
    let ignore = false;

    async function loadCurrentUser() {
      setIsAuthLoaded(false);

      try {
        const response = await fetch("/api/auth/status", {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const data = (await response.json()) as {
          authenticated?: boolean;
          user?: {
            id: string;
          } | null;
        };

        if (!ignore) {
          setCurrentUserId(response.ok && data.authenticated ? data.user?.id ?? null : null);
        }
      } catch {
        if (!ignore) {
          setCurrentUserId(null);
        }
      } finally {
        if (!ignore) {
          setIsAuthLoaded(true);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, [authSnapshot]);

  useEffect(() => {
    if (!isAuthLoaded || !currentUserId || currentUserId === profile.id) {
      return;
    }

    let ignore = false;

    async function loadFollowState() {
      try {
        const response = await fetch(`/api/users/${profile.id}/follow`, {
          headers: getAuthHeaders(),
        });
        const data = (await response.json()) as { following?: boolean };

        if (!ignore && response.ok) {
          setFollowing(Boolean(data.following));
        }
      } catch {
        if (!ignore) {
          setMessage("No se pudo cargar el estado de seguimiento.");
        }
      }
    }

    void loadFollowState();

    return () => {
      ignore = true;
    };
  }, [currentUserId, isAuthLoaded, profile.id]);

  async function handleFollowToggle() {
    setMessage("");

    if (!currentUserId) {
      setMessage("Inicia sesion para seguir usuarios.");
      return;
    }

    setIsLoadingFollow(true);

    try {
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: following ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as {
        following?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setMessage(data.error ?? "No se pudo actualizar el seguimiento.");
        return;
      }

      setFollowing(Boolean(data.following));
      window.dispatchEvent(new Event("gathergram:notifications-updated"));
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setIsLoadingFollow(false);
    }
  }

  return (
    <section className="gg-card gg-fade-up overflow-hidden rounded-3xl">
      <div
        className="h-44 border-b border-white/10 bg-[#101010] bg-cover bg-center"
        style={{
          backgroundImage: profile.banner
            ? `linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.35)), url("${profile.banner}")`
            : `linear-gradient(135deg, ${profile.profileAccentColor ?? "#3DD9EB"}33, #101010 65%)`,
        }}
      />

      <div className="px-5 pb-6 sm:px-7">
        <div className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar || "/default-avatar.svg"}
              alt={`Avatar de ${profile.name}`}
              className="-mt-16 h-32 w-32 shrink-0 rounded-full border-4 bg-[#121212] object-cover shadow-xl shadow-black/40"
              style={{
                borderColor: profile.profileAccentColor ?? "#181818",
              }}
            />

            <div
              className="min-w-0"
              style={{ color: profile.profileTextColor ?? undefined }}
            >
              <ProfileInfo
                name={profile.name}
                username={profile.username}
                bio={profile.bio}
                createdAt={profile.createdAt}
              />
            </div>
          </div>

          {isAuthLoaded && isOwnProfile ? (
            <Link
              href="/settings/profile"
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-2xl border border-cyan-300/40 px-5 py-2 text-center text-sm font-black leading-tight text-cyan-200 transition-colors duration-200 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:mt-2"
            >
              Personalizar perfil
            </Link>
          ) : isAuthLoaded ? (
            <div className="flex flex-wrap gap-2">
              <MessageProfileButton targetUserId={profile.id} />
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={isLoadingFollow}
                className={`h-11 rounded-2xl px-5 text-sm font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${
                  following
                    ? "border border-cyan-300/40 text-cyan-200 hover:bg-cyan-300/10"
                    : "bg-cyan-300 text-[#041012] hover:bg-cyan-200"
                }`}
              >
                {isLoadingFollow ? "..." : following ? "Siguiendo" : "Seguir"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <ProfileStats
            posts={profile.posts}
            followers={profile.followers}
            following={profile.following}
          />
        </div>

        {message ? (
          <p className="mt-4 text-sm font-medium text-[#55E6F7]">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
