import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <section className="px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Gestión académica
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 lg:text-5xl">
                Plataforma integral para el coloquio digital
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
                Registra equipos, organiza salas, asigna docentes, recibe
                entregas y centraliza el proceso de evaluación dentro de una
                sola plataforma.
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

            <div className="grid gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm text-zinc-500">Equipos</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  Registro centralizado
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm text-zinc-500">Docentes</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  Evaluación por salas
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm text-zinc-500">Admin</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  Control de usuarios y entregas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}