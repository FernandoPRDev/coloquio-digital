"use client";

import Image from "next/image";
import Link from "next/link";
import SidebarNav from "./SidebarNav";

type NavItem = {
  label: string;
  href: string;
};

type DashboardLayoutProps = {
  userName?: string;
  userEmail?: string;
  title: string;
  subtitle: string;
  navTitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function DashboardLayout({
  userName,
  userEmail,
  title,
  subtitle,
  navTitle,
  navItems,
  children,
}: DashboardLayoutProps) {
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-movimiento-en-marcha.png"
              alt="Movimiento en Marcha"
              width={64}
              height={64}
              className="h-12 w-auto"
              priority
            />

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#2e5090]">
                Movimiento en Marcha
              </p>
              <p className="text-xs font-medium text-zinc-500">
                Coloquio Digital
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
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

            <button
              onClick={handleLogout}
              className="rounded-xl bg-[#2e5090] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <div className="px-4 py-5 lg:px-6 lg:py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
          <SidebarNav title={navTitle} items={navItems} />

          <section className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <header className="relative overflow-hidden border-b border-zinc-200 px-6 py-7 lg:px-8">
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#2e5090]/10" />
              <div className="absolute right-20 top-12 h-20 w-20 rounded-full bg-[#009e51]/10" />

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2e5090]">
                    Panel de gestión
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                    {title}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                    {subtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  {(userName || userEmail) && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                      {userName && (
                        <p className="font-bold text-zinc-900">{userName}</p>
                      )}
                      {userEmail && (
                        <p className="mt-1 text-xs text-zinc-500">{userEmail}</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </header>

            <div className="p-6 lg:p-8">{children}</div>

            <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-5 lg:px-8">
              <div className="flex flex-col gap-2 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
                <p>
                  Movimiento en Marcha · Coloquio Digital
                </p>

                <p>
                  Plataforma de registro, evaluación y exposición de proyectos.
                </p>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
