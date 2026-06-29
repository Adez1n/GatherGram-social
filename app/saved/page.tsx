import Navbar from "@/components/Navbar";
import SavedPostsList from "@/components/saved/SavedPostsList";

export default function SavedPage() {
  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <div className="mx-auto w-full max-w-[620px] px-4 py-10">
        <SavedPostsList />
      </div>
    </main>
  );
}
