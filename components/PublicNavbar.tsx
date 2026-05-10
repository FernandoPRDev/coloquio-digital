import Image from "next/image";
import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-movimiento-en-marcha.png"
            alt="Movimiento en Marcha"
            width={64}
            height={64}
            className="h-12 w-auto"
            priority
          />

          <div className="hidden sm:block">
            <p className="text-sm font-black uppercase tracking-wide text-[#2e5090]">
              Movimiento en Marcha
            </p>
            <p className="text-xs font-medium text-zinc-500">
              Coloquio creativo
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Inicio
          </Link>

          <Link
            href="/registro"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Registro
          </Link>

          <Link
            href="/exposicion"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Exposición
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-[#2e5090] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}