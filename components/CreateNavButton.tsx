"use client";

export default function CreateNavButton() {
  function handleClick() {
    window.dispatchEvent(new Event("gathergram:open-create-post"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-11 items-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-[#041012] shadow-lg shadow-cyan-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-cyan-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
    >
      <i className="bi bi-plus-lg" aria-hidden="true" />
      <span>Crear</span>
    </button>
  );
}
