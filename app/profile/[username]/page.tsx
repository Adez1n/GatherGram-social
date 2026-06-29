import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserPosts from "@/components/profile/UserPosts";
import RightPanel from "@/components/rightpanel";
import Sidebar from "@/components/sidebar";
import { prisma } from "@/src/lib/prisma";
import { usernameParamSchema } from "@/src/lib/validators";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const parsedParams = usernameParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      username: parsedParams.data.username,
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      banner: true,
      profileTextColor: true,
      profileAccentColor: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const profile = {
    id: user.id,
    username: user.username,
    name: user.name ?? user.username,
    bio: user.bio,
    avatar: user.avatar,
    banner: user.banner,
    profileTextColor: user.profileTextColor,
    profileAccentColor: user.profileAccentColor,
    createdAt: user.createdAt.toISOString(),
    followers: user._count.followers,
    following: user._count.following,
    posts: user._count.posts,
  };

  return (
    <main className="gg-shell min-h-screen">
      <Navbar />

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[240px_minmax(0,620px)_300px] lg:px-6">
        <Sidebar />

        <div className="flex min-w-0 flex-col gap-5">
          <ProfileHeader profile={profile} />

          <Suspense
            fallback={
              <section className="gg-card rounded-3xl p-6 text-sm font-bold text-[#A3A3A3]">
                Cargando publicaciones...
              </section>
            }
          >
            <UserPosts userId={user.id} />
          </Suspense>
        </div>

        <RightPanel />
      </div>
    </main>
  );
}
