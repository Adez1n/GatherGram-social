import Link from "next/link";
import Navbar from "@/components/Navbar";
import Post from "@/components/post";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ExplorePage() {
  const [recentPosts, popularPosts, users] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        content: true,
        description: true,
        mediaUrl: true,
        mediaType: true,
        imageUrl: true,
        location: true,
        createdAt: true,
        author: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        content: true,
        author: { select: { username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        _count: { select: { followers: true } },
      },
    }),
  ]);

  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div className="gg-card rounded-3xl p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              Discover
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">Explorar</h1>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              Descubre posts recientes, populares y usuarios nuevos.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Recientes", "Populares", "Usuarios", "Tendencias"].map((tab) => (
                <span
                  key={tab}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-[#DDE5E8]"
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                title={post.content}
                description={post.description}
                likes={post._count.likes}
                commentsCount={post._count.comments}
                media={
                  post.mediaUrl
                    ? {
                        type: post.mediaType === "video" ? "video" : "image",
                        src: post.mediaUrl,
                      }
                    : post.imageUrl
                      ? { type: "image", src: post.imageUrl }
                      : null
                }
                authorName={post.author.name ?? post.author.username}
                authorHandle={`@${post.author.username}`}
                authorAvatar={post.author.avatar}
                authorId={post.author.id}
                location={post.location}
                publishedAt={formatPostDate(post.createdAt)}
              />
            ))
          ) : (
            <div className="gg-card rounded-3xl p-8 text-center text-[#A3A3A3]">
              No hay posts para explorar.
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="gg-card rounded-3xl p-5">
            <h2 className="text-lg font-black text-white">Posts populares</h2>
            <div className="mt-3 space-y-3">
              {popularPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
                >
                  <p className="truncate text-sm font-bold text-white">{post.content}</p>
                  <p className="text-xs text-[#A3A3A3]">
                    {post._count.likes} likes - @{post.author.username}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="gg-card rounded-3xl p-5">
            <h2 className="text-lg font-black text-white">Usuarios populares</h2>
            <div className="mt-3 space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.06]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || "/default-avatar.svg"}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span>
                    <span className="block text-sm font-bold text-white">
                      {user.name ?? user.username}
                    </span>
                    <span className="text-xs text-[#A3A3A3]">
                      @{user.username} - {user._count.followers} seguidores
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
