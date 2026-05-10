"use client";

import Image from "next/image";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

type SidebarNavProps = {
  title: string;
  items: NavItem[];
};

export default function SidebarNav({ title, items }: SidebarNavProps) {
  return (
    <aside className="w-full overflow-hidden rounded-[28px] bg-zinc-950 text-white shadow-xl lg:sticky lg:top-6 lg:w-72 lg:self-start">
      <div className="relative border-b border-white/10 p-6">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#2e5090]/50" />
        <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-[#f88f03]/40" />

        <div className="relative z-10">
          <Image
            src="/logo-movimiento-en-marcha.png"
            alt="Movimiento en Marcha"
            width={120}
            height={120}
            className="h-16 w-auto rounded-2xl bg-white p-2"
            priority
          />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
            Panel interno
          </p>

          <h2 className="mt-2 text-2xl font-black leading-tight">
            {title}
          </h2>
        </div>
      </div>

      <nav className="space-y-2 p-4">
        {items.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-5">
        <p className="text-xs leading-5 text-white/45">
          Movimiento en Marcha · Coloquio Creativo
        </p>
      </div>
    </aside>
  );
}