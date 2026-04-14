"use client";

import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Submission = {
  id: string;
  title: string;
  description?: string;
  publicLink: string;
  createdAt: string;
};

type Evaluation = {
  id: string;
  comments?: string | null;
  status: "PENDING" | "REVIEWED";
};

type Team = {
  id: string;
  teamName: string;
  projectName: string;
  category: string;
  members: string;
  room?: {
    id: string;
    name: string;
  } | null;
  user: User;
  submissions: Submission[];
  evaluation?: Evaluation | null;
};

export default function EquipoDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicLink, setPublicLink] = useState("");

  const fetchTeamData = async (userId: string) => {
    try {
      const response = await fetch(`/api/equipo-detalle/${userId}`);

      if (!response.ok) {
        console.error("Error HTTP al cargar detalle:", response.status);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setTeam(result.team);

        if (result.team.submissions.length > 0) {
          const latestSubmission = result.team.submissions[0];
          setTitle(latestSubmission.title || "");
          setDescription(latestSubmission.description || "");
          setPublicLink(latestSubmission.publicLink || "");
        } else {
          setTitle("");
          setDescription("");
          setPublicLink("");
        }
      }
    } catch (error) {
      console.error("Error al cargar detalle del equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);

    if (parsedUser.role !== "TEAM") {
      window.location.href = "/login";
      return;
    }

    setUser(parsedUser);
    fetchTeamData(parsedUser.id);
  }, []);

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

      if (result.ok && user) {
        alert("Entrega guardada correctamente");

        setTitle("");
        setDescription("");
        setPublicLink("");

        fetchTeamData(user.id);
      } else {
        alert(result.message || "No se pudo guardar la entrega");
      }
    } catch (error) {
      console.error("Error al enviar entrega:", error);
      alert("Ocurrió un error al guardar la entrega");
    }
  };

  return (
    <DashboardLayout
      userName={user?.name}
      userEmail={user?.email}
      title="Dashboard Equipo"
      subtitle="Consulta la información de tu equipo, tus entregas y el estado de evaluación."
      navTitle="Equipo"
      navItems={[{ label: "Panel equipo", href: "/dashboard/equipo" }]}
    >
      {loading ? (
        <p className="text-zinc-600">Cargando datos del equipo...</p>
      ) : !user ? (
        <p className="text-red-600">
          No se encontró información del usuario logueado.
        </p>
      ) : !team ? (
        <p className="text-zinc-600">No se encontraron datos del equipo.</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              Información del usuario
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Nombre</p>
                <p className="mt-1 font-semibold text-zinc-900">{user.name}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Correo</p>
                <p className="mt-1 font-semibold text-zinc-900">{user.email}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Rol</p>
                <p className="mt-1 font-semibold text-zinc-900">{user.role}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Estado</p>
                <p className="mt-1 font-semibold text-zinc-900">{user.status}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              Información del equipo
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Equipo</p>
                <p className="mt-1 font-semibold text-zinc-900">{team.teamName}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Proyecto</p>
                <p className="mt-1 font-semibold text-zinc-900">
                  {team.projectName}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Categoría</p>
                <p className="mt-1 font-semibold text-zinc-900">{team.category}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm text-zinc-500">Sala</p>
                <p className="mt-1 font-semibold text-zinc-900">
                  {team.room?.name || "Sin sala asignada"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4 md:col-span-2 xl:col-span-4">
                <p className="text-sm text-zinc-500">Integrantes</p>
                <p className="mt-1 font-semibold text-zinc-900">{team.members}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              Estado de evaluación
            </h2>

            <div className="mt-4 rounded-2xl border border-zinc-200 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-zinc-500">Estado actual:</span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    team.evaluation?.status === "REVIEWED"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {team.evaluation?.status === "REVIEWED"
                    ? "Evaluado"
                    : "Pendiente"}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-800">
                  Comentarios del docente
                </p>

                {team.evaluation?.comments ? (
                  <p className="mt-2 text-zinc-700">{team.evaluation.comments}</p>
                ) : (
                  <p className="mt-2 text-zinc-500">
                    Aún no hay comentarios registrados para este equipo.
                  </p>
                )}
              </div>
            </div>
          </section>

          {team.evaluation?.status !== "REVIEWED" ? (
            <section>
              <h2 className="text-xl font-semibold text-zinc-900">
                Registrar entrega
              </h2>

              <form
                className="mt-4 space-y-4 rounded-2xl border border-zinc-200 p-6"
                onSubmit={handleSubmitSubmission}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Título de la entrega
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Link público
                  </label>
                  <input
                    type="url"
                    value={publicLink}
                    onChange={(event) => setPublicLink(event.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-white transition hover:opacity-90"
                >
                  Guardar entrega
                </button>
              </form>
            </section>
          ) : (
            <section>
              <h2 className="text-xl font-semibold text-zinc-900">
                Entrega bloqueada
              </h2>

              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                <p className="font-medium text-green-800">
                  Tu entrega ya fue evaluada.
                </p>
                <p className="mt-2 text-sm text-green-700">
                  Ya no es posible registrar una nueva entrega o modificar la actual.
                </p>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              Entregas registradas
            </h2>

            {team.submissions.length === 0 ? (
              <p className="mt-4 text-zinc-600">
                Aún no hay entregas registradas.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {team.submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-2xl border border-zinc-200 p-5"
                  >
                    <p className="text-lg font-semibold text-zinc-900">
                      {submission.title}
                    </p>

                    {submission.description && (
                      <p className="mt-2 text-zinc-600">
                        {submission.description}
                      </p>
                    )}

                    <a
                      href={submission.publicLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Ver entrega
                    </a>

                    <p className="mt-3 text-sm text-zinc-500">
                      Registrada el{" "}
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}