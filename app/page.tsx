import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Coloquio Digital
        </h1>

        <p className="mt-4 text-gray-600">
          Plataforma de gestión del coloquio académico.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            href="/registro"
            className="rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90"
          >
            Ir a registro
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-black px-5 py-3 text-black transition hover:bg-black hover:text-white"
          >
            Ir a login
          </Link>
        </div>
      </div>
    </main>
  );
}