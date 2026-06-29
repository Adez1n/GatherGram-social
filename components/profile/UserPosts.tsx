import Post from "@/components/post";
import { prisma } from "@/src/lib/prisma";

type UserPostsProps = {
  userId: string;
};

type RepostRow = {
  postId: string;
  repostedAt: Date | string;
};

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function UserPosts({ userId }: UserPostsProps) {
  const [posts, repostRows] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
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
    }),
    prisma.$queryRaw<RepostRow[]>`
      SELECT postId, createdAt AS repostedAt
      FROM Repost
      WHERE userId = ${userId}
      ORDER BY createdAt DESC
    `,
  ]);

  const repostedPostIds = repostRows.map((row) => row.postId);
  const repostedPosts =
    repostedPostIds.length > 0
      ? await prisma.post.findMany({
          where: {
            id: {
              in: repostedPostIds,
            },
          },
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
        })
      : [];

  const repostedAtByPostId = new Map(
    repostRows.map((row) => [row.postId, new Date(row.repostedAt)]),
  );
  const timelineItems = [
    ...posts.map((post) => ({
      key: `post-${post.id}`,
      post,
      sortDate: post.createdAt,
      contextLabel: null as string | null,
    })),
    ...repostedPosts.map((post) => ({
      key: `repost-${post.id}`,
      post,
      sortDate: repostedAtByPostId.get(post.id) ?? post.createdAt,
      contextLabel: "Reposteado",
    })),
  ].sort((first, second) => second.sortDate.getTime() - first.sortDate.getTime());

  if (timelineItems.length === 0) {
    return (
      <section className="rounded-md border border-[#2E2E2E] bg-[#181818] p-6 text-center shadow-2xl shadow-black/20">
        <h2 className="text-lg font-black text-[#F5F5F5]">
          Todavia no hay publicaciones
        </h2>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Cuando este usuario publique o repostee algo, aparecera aqui.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {timelineItems.map(({ key, post, contextLabel }) => (
        <Post
          key={key}
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
          contextLabel={contextLabel ?? undefined}
          location={post.location}
          publishedAt={formatPostDate(post.createdAt)}
        />
      ))}
    </section>
  );
}
