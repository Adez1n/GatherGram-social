import CreatePost from "@/components/CreatePost";
import HomeClient from "@/components/home/HomeClient";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";
import Post from "@/components/post";
import RightPanel from "@/components/rightpanel";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

type FeedPost = {
  id: string;
  content: string;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  imageUrl: string | null;
  location: string | null;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
};

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function Page() {
  const posts: FeedPost[] = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
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

  return (
    <HomeClient>
      <main className="gg-shell min-h-screen">
        <Navbar />

        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[240px_minmax(0,560px)_300px] lg:px-6">
          <Sidebar />

          <div className="flex min-w-0 flex-col gap-5">
            <CreatePost />

            {posts.length > 0 ? (
              posts.map((post) => (
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
                  authorName={post.author.username}
                  authorHandle={`@${post.author.username}`}
                  authorAvatar={post.author.avatar}
                  authorId={post.author.id}
                  location={post.location}
                  publishedAt={formatPostDate(post.createdAt)}
                />
              ))
            ) : (
              <section className="gg-card gg-fade-up rounded-3xl p-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <i className="bi bi-stars" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-black text-white">
                  Todavia no hay publicaciones
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
                  Crea el primer post de GatherGram y enciende el feed.
                </p>
              </section>
            )}
          </div>

          <RightPanel />
        </div>
      </main>
    </HomeClient>
  );
}
