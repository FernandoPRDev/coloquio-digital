import PublicFooter from "./PublicFooter";
import PublicNavbar from "./PublicNavbar";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-100">
      <PublicNavbar />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </main>
  );
}