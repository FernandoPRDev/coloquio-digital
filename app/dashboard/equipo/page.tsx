"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Team = {
  id: string;
  teamName: string;
  projectName: string;
  category: string;
  members: string;
  user: User;
};

type Submission = {
  id: string;
  title: string;
  description?: string;
  publicLink: string;
  createdAt: string;
};

export default function EquipoDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicLink, setPublicLink] = useState("");

  const fetchSubmissions = async (teamId: string) => {
    try {
      const response = await fetch(`/api/submissions/${teamId}`);

      if (!response.ok) {
        console.error("Error HTTP al cargar entregas:", response.status);
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setSubmissions(result.submissions);
      }
    } catch (error) {
      console.error("Error al cargar entregas:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/equipo/${parsedUser.id}`);

        if (!response.ok) {
          console.error("Error HTTP:", response.status);
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.ok) {
          setTeam(result.team);
          fetchSubmissions(result.team.id);
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Error al cargar equipo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleSubmitSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!team) return;

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          publicLink,
          teamId: team.id,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        alert("Entrega guardada correctamente");

        setTitle("");
        setDescription("");
        setPublicLink("");

        fetchSubmissions(team.id);
      } else {
        alert(result.message || "No se pudo guardar la entrega");
      }
    } catch (error) {
      console.error("Error al enviar entrega:", error);
      alert("Ocurrió un error al guardar la entrega");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Equipo
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-black px-4 py-2 text-white transition hover:opacity-90"
          >
            Cerrar sesión
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-gray-600">Cargando datos del equipo...</p>
        ) : !user ? (
          <p className="mt-6 text-red-600">
            No se encontró información del usuario logueado.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Información del usuario
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="mt-1 font-semibold text-gray-900">{user.name}</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Correo</p>
                  <p className="mt-1 font-semibold text-gray-900">{user.email}</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="mt-1 font-semibold text-gray-900">{user.role}</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="mt-1 font-semibold text-gray-900">{user.status}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Información del equipo
              </h2>

              {!team ? (
                <p className="mt-4 text-gray-600">
                  No se encontraron datos del equipo.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Nombre del equipo</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {team.teamName}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Nombre del proyecto</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {team.projectName}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {team.category}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                    <p className="text-sm text-gray-500">Integrantes</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {team.members}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {team && (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Registrar entrega
                  </h2>

                  <form
                    className="mt-4 space-y-4 rounded-xl border border-gray-200 p-6"
                    onSubmit={handleSubmitSubmission}
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-800">
                        Título de la entrega
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-800">
                        Descripción
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-800">
                        Link público
                      </label>
                      <input
                        type="url"
                        value={publicLink}
                        onChange={(event) => setPublicLink(event.target.value)}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90"
                    >
                      Guardar entrega
                    </button>
                  </form>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Entregas registradas
                  </h2>

                  {submissions.length === 0 ? (
                    <p className="mt-4 text-gray-600">
                      Aún no hay entregas registradas.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <p className="text-lg font-semibold text-gray-900">
                            {submission.title}
                          </p>

                          {submission.description && (
                            <p className="mt-2 text-gray-600">
                              {submission.description}
                            </p>
                          )}

                          <a
                            href={submission.publicLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-sm font-medium text-blue-600 underline"
                          >
                            Ver entrega
                          </a>

                          <p className="mt-3 text-sm text-gray-500">
                            Registrada el{" "}
                            {new Date(submission.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}