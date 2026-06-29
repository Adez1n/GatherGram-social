"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";

type PostMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

type LocalComment = {
  id: string;
  text: string;
  parentId: string | null;
  isPinned: boolean;
  createdAt?: string;
  likesCount: number;
  liked: boolean;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
};

type PostProps = {
  postId: string;
  title: string;
  description?: string | null;
  likes: number;
  repostsCount?: number;
  commentsCount?: number;
  media?: PostMedia | null;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string | null;
  authorId?: string;
  contextLabel?: string;
  location?: string | null;
  publishedAt?: string;
};

function formatLikes(likes: number) {
  return new Intl.NumberFormat("es", {
    notation: likes >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(likes);
}

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");

  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getCurrentUserIdSnapshot() {
  return localStorage.getItem("gathergram_user_id");
}

function getServerCurrentUserIdSnapshot() {
  return null;
}

export default function Post({
  postId,
  title,
  description,
  likes,
  repostsCount = 0,
  commentsCount = 0,
  media,
  authorName = "GatherGram",
  authorHandle = "@gathergram",
  authorAvatar,
  authorId,
  contextLabel,
  location,
  publishedAt = "Ahora",
}: PostProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [reposts, setReposts] = useState(repostsCount);
  const [reposted, setReposted] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedImage, setExpandedImage] = useState<PostMedia | null>(null);
  const currentUserId = useSyncExternalStore(
    subscribeToAuthChanges,
    getCurrentUserIdSnapshot,
    getServerCurrentUserIdSnapshot,
  );
  const canDelete = Boolean(authorId && currentUserId === authorId);
  const authorUsername = authorHandle.replace(/^@/, "").trim();
  const profileHref = authorUsername
    ? `/profile/${encodeURIComponent(authorUsername)}`
    : null;
  const visibleCommentsCount = commentsLoaded
    ? comments.length
    : commentsCount + comments.length;
  const topLevelComments = comments
    .filter((item) => !item.parentId)
    .sort((first, second) => {
      if (first.isPinned !== second.isPinned) {
        return first.isPinned ? -1 : 1;
      }

      return 0;
    });

  function getReplies(parentId: string) {
    return comments.filter((item) => item.parentId === parentId);
  }

  function shouldIgnorePostNavigation(target: EventTarget | null) {
    return target instanceof HTMLElement
      ? Boolean(target.closest("a, button, input, textarea, label, video"))
      : false;
  }

  function openPost(event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
    if (event && shouldIgnorePostNavigation(event.target)) {
      return;
    }

    router.push(`/post/${postId}`);
  }

  function handlePostKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter") {
      openPost(event);
    }
  }

  useEffect(() => {
    let ignored = false;

    async function syncLikeStatus() {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const data = (await response.json()) as {
          liked?: boolean;
          likesCount?: number;
        };

        if (!response.ok || ignored) {
          return;
        }

        setLiked(Boolean(data.liked));
        setLikesCount(data.likesCount ?? likes);
      } catch {
        // The post can still render with its server-provided count.
      }
    }

    void syncLikeStatus();

    return () => {
      ignored = true;
    };
  }, [currentUserId, likes, postId]);

  useEffect(() => {
    let ignored = false;

    async function syncRepostStatus() {
      try {
        const response = await fetch(`/api/posts/${postId}/repost`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const data = (await response.json()) as {
          reposted?: boolean;
          repostsCount?: number;
        };

        if (!response.ok || ignored) {
          return;
        }

        setReposted(Boolean(data.reposted));
        setReposts(data.repostsCount ?? repostsCount);
      } catch {
        // The post can still render with its server-provided count.
      }
    }

    void syncRepostStatus();

    return () => {
      ignored = true;
    };
  }, [currentUserId, postId, repostsCount]);

  useEffect(() => {
    let ignored = false;

    async function loadComments() {
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const data = (await response.json()) as {
          comments?: LocalComment[];
        };

        if (ignored) {
          return;
        }

        if (!response.ok) {
          setFeedback("No se pudieron cargar los comentarios.");
          setCommentsLoaded(true);
          return;
        }

        setComments(data.comments ?? []);
        setCommentsLoaded(true);
      } catch {
        if (!ignored) {
          setCommentsLoaded(true);
          setFeedback("No se pudieron cargar los comentarios.");
        }
      } finally {
        if (!ignored) {
          setIsLoadingComments(false);
        }
      }
    }

    void loadComments();

    return () => {
      ignored = true;
    };
  }, [currentUserId, postId]);

  async function handleLike() {
    setFeedback("");
    setIsLiking(true);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudo actualizar el like.");
        return;
      }

      setLiked(Boolean(data.liked));
      setLikesCount(data.likesCount ?? likesCount);
      window.dispatchEvent(new Event("gathergram:notifications-updated"));
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    } finally {
      setIsLiking(false);
    }
  }

  async function handleRepost() {
    setFeedback("");
    setIsReposting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/repost`, {
        method: reposted ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as {
        reposted?: boolean;
        repostsCount?: number;
        error?: string;
      };

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudo actualizar el repost.");
        return;
      }

      setReposted(Boolean(data.reposted));
      setReposts(data.repostsCount ?? reposts);
      router.refresh();
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    } finally {
      setIsReposting(false);
    }
  }

  async function createComment(text: string, parentId?: string) {
    setFeedback("");

    const trimmedComment = text.trim();

    if (!trimmedComment) {
      setFeedback(parentId ? "Escribe una respuesta." : "Escribe un comentario.");
      return false;
    }

    setIsCommenting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ text: trimmedComment, parentId }),
      });
      const data = (await response.json()) as {
        comment?: {
          id: string;
          text: string;
          parentId: string | null;
          isPinned: boolean;
          createdAt?: string;
          likesCount?: number;
          liked?: boolean;
          author: {
            id: string;
            username: string;
            name: string | null;
            avatar: string | null;
          };
        };
        error?: string;
      };

      if (!response.ok || !data.comment) {
        setFeedback(data.error ?? "No se pudo comentar.");
        return;
      }

      setComments((currentComments) => [
        ...currentComments,
        {
          id: data.comment!.id,
          text: data.comment!.text,
          parentId: data.comment!.parentId,
          isPinned: data.comment!.isPinned,
          createdAt: data.comment!.createdAt,
          likesCount: data.comment!.likesCount ?? 0,
          liked: Boolean(data.comment!.liked),
          author: data.comment!.author,
        },
      ]);
      window.dispatchEvent(new Event("gathergram:notifications-updated"));
      router.refresh();
      return true;
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
      return false;
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await createComment(comment);

    if (created) {
      setComment("");
    }
  }

  async function handleReplySubmit(event: FormEvent<HTMLFormElement>, parentId: string) {
    event.preventDefault();
    const created = await createComment(replyText, parentId);

    if (created) {
      setReplyText("");
      setReplyToId(null);
    }
  }

  async function handleCommentLike(commentId: string) {
    const targetComment = comments.find((item) => item.id === commentId);

    if (!targetComment) {
      return;
    }

    setFeedback("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/like`,
        {
          method: targetComment.liked ? "DELETE" : "POST",
          headers: getAuthHeaders(),
        },
      );
      const data = (await response.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudo actualizar el like del comentario.");
        return;
      }

      setComments((currentComments) =>
        currentComments.map((item) =>
          item.id === commentId
            ? {
                ...item,
                liked: Boolean(data.liked),
                likesCount: data.likesCount ?? item.likesCount,
              }
            : item,
        ),
      );
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    }
  }

  async function handlePinComment(commentId: string) {
    setFeedback("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/pin`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );
      const data = (await response.json()) as {
        pinned?: boolean;
        commentId?: string;
        error?: string;
      };

      if (!response.ok || !data.commentId) {
        setFeedback(data.error ?? "No se pudo fijar el comentario.");
        return;
      }

      setComments((currentComments) =>
        currentComments.map((item) =>
          item.parentId
            ? item
            : {
                ...item,
                isPinned: data.pinned ? item.id === data.commentId : false,
              },
        ),
      );
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    }
  }

  async function handleShare() {
    setFeedback("");

    const url = `${window.location.origin}/#post-${postId}`;

    if (navigator.share) {
      await navigator.share({
        title,
        text: description ?? title,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    setFeedback("Link copiado.");
  }

  async function handleSave() {
    setFeedback("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: saved ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as { saved?: boolean; error?: string };

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudo actualizar guardados.");
        return;
      }

      setSaved(Boolean(data.saved));
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm("Eliminar esta publicacion?");

    if (!shouldDelete) {
      return;
    }

    setFeedback("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFeedback(data.error ?? "No se pudo eliminar el post.");
        return;
      }

      setIsDeleted(true);
      router.refresh();
    } catch {
      setFeedback("No se pudo conectar con el servidor.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isDeleted) {
    return null;
  }

  return (
    <>
    <article
      id={`post-${postId}`}
      role="link"
      tabIndex={0}
      onClick={openPost}
      onKeyDown={handlePostKeyDown}
      className="gg-card gg-card-hover gg-fade-up cursor-pointer overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
      aria-label={`Abrir post de ${authorName}`}
    >
      {contextLabel ? (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs font-black text-cyan-200">
          <i className="bi bi-repeat" aria-hidden="true" />
          {contextLabel}
        </div>
      ) : null}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {profileHref ? (
            <Link
              href={profileHref}
              aria-label={`Ver perfil de ${authorName}`}
              onClick={(event) => event.stopPropagation()}
              className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={authorAvatar || "/default-avatar.svg"}
                alt={`Avatar de ${authorName}`}
                className="h-11 w-11 rounded-full border border-cyan-300/25 bg-cyan-300/10 object-cover transition duration-200 hover:border-cyan-200"
              />
            </Link>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorAvatar || "/default-avatar.svg"}
              alt={`Avatar de ${authorName}`}
              className="h-11 w-11 shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 object-cover"
            />
          )}

          {profileHref ? (
            <Link
              href={profileHref}
              onClick={(event) => event.stopPropagation()}
              className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <p className="truncate text-sm font-black text-white transition-colors duration-200 hover:text-cyan-200">
                {authorName}
              </p>
              <p className="truncate text-xs text-[#A3A3A3]">
                {authorHandle} - {publishedAt}
              </p>
            </Link>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{authorName}</p>
              <p className="truncate text-xs text-[#A3A3A3]">
                {authorHandle} - {publishedAt}
              </p>
            </div>
          )}
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Eliminar publicacion"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#A3A3A3] transition-colors duration-200 hover:bg-white/[0.06] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="bi bi-trash3-fill" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Mas opciones"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#A3A3A3] transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            <i className="bi bi-three-dots" aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="relative bg-[#080A0B]">
        {media ? (
          media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.src}
              alt={media.alt ?? title}
              onClick={(event) => {
                event.stopPropagation();
                setExpandedImage(media);
              }}
              className="max-h-[430px] w-full object-cover"
            />
          ) : (
            <video
              src={media.src}
              controls
              className="max-h-[430px] w-full object-cover"
            />
          )
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#080A0B] text-sm font-bold text-[#6B7280]">
            Sin media
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className={`grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${
                liked ? "scale-105 text-cyan-200 shadow-[0_0_24px_rgba(103,232,249,0.16)]" : "text-white"
              }`}
              aria-label={liked ? "Quitar like" : "Dar like"}
            >
              <i className="bi bi-heart-fill" aria-hidden="true" />
            </button>
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <button
                type="button"
                onClick={handleRepost}
                disabled={isReposting}
                className={`grid h-10 w-10 place-items-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${
                  reposted ? "text-cyan-200" : "text-white"
                }`}
                aria-label={reposted ? "Quitar repost" : "Repostear"}
              >
                <i className="bi bi-repeat" aria-hidden="true" />
              </button>
              <span className="pr-3 text-sm font-black text-white">
                {formatLikes(reposts)}
              </span>
            </div>
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setShowCommentBox((isOpen) => !isOpen)}
                className="grid h-10 w-10 place-items-center rounded-2xl text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                aria-label="Comentar"
              >
                <i className="bi bi-chat-left-text-fill" aria-hidden="true" />
              </button>
              <span className="pr-3 text-sm font-black text-white">
                {visibleCommentsCount}
              </span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              aria-label="Compartir"
            >
              <i className="bi bi-send-fill" aria-hidden="true" />
            </button>
          </div>

          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white">
            {formatLikes(likesCount)} likes
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black leading-tight text-white">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">{description}</p>
          ) : null}
          {location ? (
            <p className="mt-3 text-xs font-bold text-cyan-200">
              <i className="bi bi-geo-alt-fill mr-2" aria-hidden="true" />
              {location}
            </p>
          ) : null}
        </div>

        {showCommentBox ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isCommenting}
              placeholder="Escribe un comentario"
              className="h-10 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#6B7280] focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
            />
            <button
              type="submit"
              disabled={isCommenting}
              className="rounded-2xl bg-cyan-300 px-4 text-sm font-black text-[#041012] transition-all duration-200 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCommenting ? "..." : "Enviar"}
            </button>
          </form>
        ) : null}

        {showCommentBox && isLoadingComments ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm font-bold text-[#A3A3A3]">
            Cargando comentarios...
          </div>
        ) : null}

        {showCommentBox && !isLoadingComments && comments.length === 0 && visibleCommentsCount > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm font-bold text-cyan-200">
            No se pudieron mostrar los comentarios. Recarga la pagina.
          </div>
        ) : null}

        {showCommentBox && comments.length > 0 ? (
          <div className="space-y-3 border-t border-white/10 pt-3">
            {topLevelComments.map((item) => (
              <div key={item.id} className="space-y-2">
              <div className={`flex gap-3 rounded-2xl p-3 ${
                item.isPinned
                  ? "border border-cyan-300/25 bg-cyan-300/10"
                  : "bg-white/[0.03]"
              }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.author.avatar || "/default-avatar.svg"}
                  alt={`Avatar de ${item.author.name ?? item.author.username}`}
                  className="h-9 w-9 shrink-0 rounded-full border border-cyan-300/20 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#A3A3A3]">
                    <span className="font-black text-white">
                      {item.author.name ?? item.author.username}
                    </span>{" "}
                    {item.isPinned ? (
                      <span className="mr-1 rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-200">
                        Fijado
                      </span>
                    ) : null}
                    <span className="text-xs font-bold text-[#6B7280]">
                      @{item.author.username}
                    </span>
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-[#D4D4D4]">
                    {item.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCommentLike(item.id);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-black transition hover:bg-white/[0.06] ${
                        item.liked ? "text-cyan-200" : "text-[#8B949E]"
                      }`}
                      aria-label={
                        item.liked
                          ? "Quitar like del comentario"
                          : "Dar like al comentario"
                      }
                    >
                      <i
                        className={item.liked ? "bi bi-heart-fill" : "bi bi-heart"}
                        aria-hidden="true"
                      />
                      {item.likesCount}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyToId((current) => (current === item.id ? null : item.id))
                      }
                      className="rounded-full px-2 py-1 text-xs font-black text-[#8B949E] transition hover:bg-white/[0.06] hover:text-cyan-200"
                    >
                      Responder
                    </button>
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handlePinComment(item.id);
                        }}
                        className="rounded-full px-2 py-1 text-xs font-black text-[#8B949E] transition hover:bg-white/[0.06] hover:text-cyan-200"
                      >
                        {item.isPinned ? "Desfijar" : "Fijar"}
                      </button>
                    ) : null}
                  </div>

                  {replyToId === item.id ? (
                    <form
                      onSubmit={(event) => {
                        void handleReplySubmit(event, item.id);
                      }}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        disabled={isCommenting}
                        placeholder={`Responder a @${item.author.username}`}
                        className="h-9 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#6B7280] focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
                      />
                      <button
                        type="submit"
                        disabled={isCommenting}
                        className="rounded-2xl bg-cyan-300 px-3 text-xs font-black text-[#041012] transition hover:bg-cyan-200 disabled:opacity-60"
                      >
                        Enviar
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
              {getReplies(item.id).length > 0 ? (
                <div className="ml-8 space-y-2 border-l border-white/10 pl-3">
                  {getReplies(item.id).map((reply) => (
                    <div key={reply.id} className="flex gap-3 rounded-2xl bg-white/[0.025] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reply.author.avatar || "/default-avatar.svg"}
                        alt={`Avatar de ${reply.author.name ?? reply.author.username}`}
                        className="h-8 w-8 shrink-0 rounded-full border border-cyan-300/20 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#A3A3A3]">
                          <span className="font-black text-white">
                            {reply.author.name ?? reply.author.username}
                          </span>{" "}
                          <span className="text-xs font-bold text-[#6B7280]">
                            @{reply.author.username}
                          </span>
                        </p>
                        <p className="mt-1 break-words text-sm leading-6 text-[#D4D4D4]">
                          {reply.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            void handleCommentLike(reply.id);
                          }}
                          className={`mt-2 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-black transition hover:bg-white/[0.06] ${
                            reply.liked ? "text-cyan-200" : "text-[#8B949E]"
                          }`}
                          aria-label={
                            reply.liked
                              ? "Quitar like de la respuesta"
                              : "Dar like a la respuesta"
                          }
                        >
                          <i
                            className={reply.liked ? "bi bi-heart-fill" : "bi bi-heart"}
                            aria-hidden="true"
                          />
                          {reply.likesCount}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {feedback ? (
          <p className="text-sm font-medium text-cyan-200">{feedback}</p>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-colors duration-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60 ${
            saved ? "text-cyan-200" : "text-[#A3A3A3]"
          }`}
        >
          <i className={saved ? "bi bi-bookmark-fill" : "bi bi-bookmark"} aria-hidden="true" />
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>
    </article>
    {expandedImage ? (
      <div
        className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Imagen ampliada"
        onClick={() => setExpandedImage(null)}
      >
        <button
          type="button"
          aria-label="Cerrar imagen"
          onClick={() => setExpandedImage(null)}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={expandedImage.src}
          alt={expandedImage.alt ?? title}
          className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl shadow-black/70"
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    ) : null}
    </>
  );
}
