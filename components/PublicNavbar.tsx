import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          Coloquio Digital
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Inicio
          </Link>

          <Link
            href="/registro"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Registro
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