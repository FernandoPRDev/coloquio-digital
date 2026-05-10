"use client";

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
    <main className="min-h-screen bg-zinc-100 p-4 lg:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <SidebarNav title={navTitle} items={navItems} />

        <section className="flex-1 rounded-2xl bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
              <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              {(userName || userEmail) && (
                <div className="text-sm text-zinc-600">
                  {userName && (
                    <p className="font-semibold text-zinc-900">{userName}</p>
                  )}
                  {userEmail && <p>{userEmail}</p>}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}