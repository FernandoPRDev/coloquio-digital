import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <section className="px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm lg:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Plataforma académica
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 lg:text-5xl">
            Coloquio Digital
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Gestiona el registro de equipos, la aprobación de participantes,
            las entregas de proyectos y la revisión por parte de docentes dentro
            de un mismo entorno.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/registro"
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Registrar equipo
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}