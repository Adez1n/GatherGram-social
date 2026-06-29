import Navbar from "@/components/Navbar";
import SecuritySettingsForm from "@/components/settings/SecuritySettingsForm";

export default function SecuritySettingsPage() {
  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <SecuritySettingsForm />
      </div>
    </main>
  );
}
