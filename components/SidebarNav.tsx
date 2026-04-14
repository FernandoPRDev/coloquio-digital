"use client";

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
    <aside className="w-full rounded-2xl bg-zinc-900 p-5 text-white lg:w-72">
      <div className="border-b border-white/10 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Coloquio Digital
        </p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      </div>

      <nav className="mt-5 space-y-2">
        {items.map((item, index) => (
        <a
            key={`${item.href}-${index}`}
            href={item.href}
            className="block rounded-xl px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}