import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ChatLayout from "@/components/messages/ChatLayout";

export default function MessagesPage() {
  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <div className="px-4 py-8">
        <Suspense
          fallback={
            <div className="gg-card mx-auto max-w-6xl rounded-3xl p-6 text-sm font-bold text-[#A3A3A3]">
              Cargando mensajes...
            </div>
          }
        >
          <ChatLayout />
        </Suspense>
      </div>
    </main>
  );
}
