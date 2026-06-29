"use client";

import { useEffect, useState } from "react";
import Post from "@/components/post";

type SavedPost = {
  id: string;
  content: string;
  description: string | null;
  imageUrl: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  location: string | null;
  createdAt: string;
  author: { id: string; username: string; name: string | null; avatar: string | null };
  _count: { likes: number; comments: number };
};

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");
  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function SavedPostsList() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/saved", { headers: getAuthHeaders() });
        const data = (await response.json()) as { posts?: SavedPost[]; error?: string };
        if (response.ok) setPosts(data.posts ?? []);
        else setMessage(data.error ?? "No se pudieron cargar guardados.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <p className="text-sm font-bold text-[#A3A3A3]">Cargando guardados...</p>;
  if (message) return <p className="text-sm font-bold text-[#55E6F7]">{message}</p>;
  if (posts.length === 0) {
    return (
      <section className="rounded-md border border-[#2E2E2E] bg-[#181818] p-6 text-center">
        <h1 className="text-xl font-black text-[#F5F5F5]">No tienes guardados</h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">Guarda posts para verlos aqui.</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {posts.map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          title={post.content}
          description={post.description}
          likes={post._count.likes}
          commentsCount={post._count.comments}
          media={post.mediaUrl ? { type: post.mediaType === "video" ? "video" : "image", src: post.mediaUrl } : post.imageUrl ? { type: "image", src: post.imageUrl } : null}
          authorName={post.author.name ?? post.author.username}
          authorHandle={`@${post.author.username}`}
          authorAvatar={post.author.avatar}
          authorId={post.author.id}
          location={post.location}
          publishedAt={new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.createdAt))}
        />
      ))}
    </section>
  );
}
