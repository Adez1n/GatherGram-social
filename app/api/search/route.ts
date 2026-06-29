import { type NextRequest } from "next/server";
import { handleApiError, jsonResponse } from "@/src/lib/api";
import { prisma } from "@/src/lib/prisma";
import { searchSchema } from "@/src/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const query = searchSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const q = query.q.trim();

    if (!q) {
      return jsonResponse({ users: [], posts: [], hashtags: [] });
    }

    const shouldSearchUsers = query.type === "all" || query.type === "users";
    const shouldSearchPosts = query.type === "all" || query.type === "posts";
    const shouldSearchHashtags = query.type === "all" || query.type === "hashtags";

    const [users, posts] = await Promise.all([
      shouldSearchUsers
        ? prisma.user.findMany({
            where: {
              OR: [
                { username: { contains: q } },
                { name: { contains: q } },
              ],
            },
            take: query.limit,
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          })
        : [],
      shouldSearchPosts
        ? prisma.post.findMany({
            where: {
              OR: [
                { content: { contains: q } },
                { description: { contains: q } },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: query.limit,
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          })
        : [],
    ]);

    const hashtagMatches = shouldSearchHashtags
      ? Array.from(
          new Set(
            posts
              .flatMap((post) => post.content.match(/#[a-zA-Z0-9_]+/g) ?? [])
              .filter((tag) => tag.toLowerCase().includes(q.toLowerCase())),
          ),
        ).slice(0, query.limit)
      : [];

    return jsonResponse({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name ?? user.username,
        avatar: user.avatar,
      })),
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          username: post.author.username,
          name: post.author.name ?? post.author.username,
          avatar: post.author.avatar,
        },
      })),
      hashtags: hashtagMatches,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
