import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <Link href="/" className="text-lg font-bold text-zinc-900">
            Coloquio Digital
          </Link>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Plataforma académica
          </p>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Inicio
          </Link>

          <Link
            href="/registro"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Registro
          </Link>
          <Link
            href="/exposicion"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Exposición
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}