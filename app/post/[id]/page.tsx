import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Post from "@/components/post";
import RightPanel from "@/components/rightpanel";
import Sidebar from "@/components/sidebar";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      description: true,
      mediaUrl: true,
      mediaType: true,
      imageUrl: true,
      location: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="gg-shell min-h-screen">
      <Navbar />

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[240px_minmax(0,620px)_300px] lg:px-6">
        <Sidebar />

        <div className="flex min-w-0 flex-col gap-5">
          <div className="gg-card gg-fade-up flex h-14 items-center gap-3 rounded-3xl px-4">
            <Link
              href="/"
              aria-label="Volver"
              className="grid h-10 w-10 place-items-center rounded-2xl text-white transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </Link>
            <h1 className="text-lg font-black text-white">Post</h1>
          </div>

          <Post
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
                    alt: "Publicacion de GatherGram",
                  }
                : post.imageUrl
                  ? {
                      type: "image",
                      src: post.imageUrl,
                      alt: "Publicacion de GatherGram",
                    }
                  : null
            }
            authorName={post.author.name ?? post.author.username}
            authorHandle={`@${post.author.username}`}
            authorAvatar={post.author.avatar}
            authorId={post.author.id}
            location={post.location}
            publishedAt={formatPostDate(post.createdAt)}
          />
        </div>

        <RightPanel />
      </div>
    </main>
  );
}
