import Navbar from "@/components/Navbar";
import NotificationList from "@/components/notifications/NotificationList";
import RightPanel from "@/components/rightpanel";
import Sidebar from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <main className="gg-shell min-h-screen">
      <Navbar />

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 pt-6 lg:grid-cols-[240px_minmax(0,620px)_300px] lg:px-6">
        <Sidebar />

        <div className="min-w-0">
          <NotificationList />
        </div>

        <RightPanel />
      </div>
    </main>
  );
}
