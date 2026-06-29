import ProfileIndexClient from "@/components/profile/ProfileIndexClient";

export const dynamic = "force-dynamic";

export default async function ProfileIndexPage() {
  return (
    <main className="gg-shell grid min-h-screen place-items-center px-4">
      <ProfileIndexClient />
    </main>
  );
}
