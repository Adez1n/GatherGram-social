import Navbar from "@/components/Navbar";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      username: true,
      bio: true,
      avatar: true,
      banner: true,
      profileTextColor: true,
      profileAccentColor: true,
    },
  });

  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ProfileSettingsForm
          initialValues={{
            name: user?.name ?? "",
            username: user?.username ?? "",
            bio: user?.bio ?? "",
            avatar: user?.avatar ?? "",
            banner: user?.banner ?? "",
            profileTextColor: user?.profileTextColor ?? "#F5F5F5",
            profileAccentColor: user?.profileAccentColor ?? "#3DD9EB",
          }}
        />
      </div>
    </main>
  );
}
