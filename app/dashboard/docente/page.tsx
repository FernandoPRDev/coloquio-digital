"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type Submission = {
  id: string;
  title: string;
  description?: string;
  publicLink?: string | null;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  pdfFilename?: string | null;
  videoFilename?: string | null;
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
  user: {
    id: string;
    name: string;
    email: string;
  };
  submissions: Submission[];
  evaluation?: Evaluation | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Room = {
  id: string;
  name: string;
};

export default function DocenteDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEWED">("PENDING");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const fetchTeacherTeams = async (userId: string) => {
    try {
      const response = await fetch(`/api/docente/evaluaciones/${userId}`);

      if (!response.ok) {
        console.error("Error HTTP al cargar equipos:", response.status);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setRoom(result.room);
        setTeams(result.teams);

        const initialDrafts: Record<string, string> = {};
        result.teams.forEach((team: Team) => {
          initialDrafts[team.id] = team.evaluation?.comments || "";
        });
        setCommentDrafts(initialDrafts);
      }
    } catch (error) {
      console.error("Error al cargar equipos del docente:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!result.ok || result.user.role !== "TEACHER") {
          window.location.href = "/login";
          return;
        }

        setUser(result.user);
        await fetchTeacherTeams(result.user.id);
      } catch (error) {
        console.error("Error al cargar sesión docente:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const status = team.evaluation?.status || "PENDING";
      return status === activeTab;
    });
  }, [teams, activeTab]);

  const handleCommentChange = (teamId: string, value: string) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [teamId]: value,
    }));
  };

  const handleEvaluate = async (teamId: string) => {
    try {
      const response = await fetch("/api/docente/evaluar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          comments: commentDrafts[teamId] || "",
        }),
      });

      const result = await response.json();

      if (result.ok && user) {
        alert("Evaluación guardada correctamente");
        fetchTeacherTeams(user.id);
      } else {
        alert(result.message || "No se pudo guardar la evaluación");
      }
    } catch (error) {
      console.error("Error al evaluar equipo:", error);
      alert("Ocurrió un error al guardar la evaluación");
    }
  };

  return (
    <DashboardLayout
      userName={user?.name}
      userEmail={user?.email}
      title="Panel Docente"
      subtitle={
        room
          ? `Consulta y evalúa los equipos asignados a ${room.name}.`
          : "Consulta y evalúa los equipos asignados."
      }
      navTitle="Docente"
      navItems={[
        { label: "Panel docente", href: "/dashboard/docente" },
      ]}
    >
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === "PENDING"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
          >
            Pendientes
          </button>

          <button
            onClick={() => setActiveTab("REVIEWED")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === "REVIEWED"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
          >
            Evaluados
          </button>

          {room && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
              {room.name}
            </span>
          )}
        </div>

        {loading ? (
          <p className="mt-6 text-zinc-600">Cargando equipos...</p>
        ) : filteredTeams.length === 0 ? (
          <p className="mt-6 text-zinc-600">
            No hay equipos en esta vista.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {filteredTeams.map((team) => (
              <article
                key={team.id}
                className="rounded-2xl border border-zinc-200 p-5 shadow-sm"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Equipo
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900">
                      {team.teamName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Proyecto
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900">
                      {team.projectName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Categoría
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                      {team.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Representante
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900">
                      {team.user.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Correo
                    </p>
                    <p className="mt-1 text-zinc-700">{team.user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Integrantes
                    </p>
                    <p className="mt-1 text-zinc-700">{team.members}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-zinc-900">
                    Entregas del equipo
                  </p>

                  {team.submissions.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      Este equipo aún no ha registrado entregas.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {team.submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="rounded-xl bg-zinc-50 p-4"
                        >
                          <p className="font-medium text-zinc-900">
                            {submission.title}
                          </p>

                          {submission.description && (
                            <p className="mt-2 text-sm text-zinc-600">
                              {submission.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-4">
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              {submission.pdfUrl && (
                                <a
                                  href={submission.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                  Ver PDF
                                </a>
                              )}

                              {submission.videoUrl && (
                                <a
                                  href={submission.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                                >
                                  Ver video
                                </a>
                              )}

                              {!submission.pdfUrl && !submission.videoUrl && submission.publicLink && (
                                <a
                                  href={submission.publicLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                  Ver entrega
                                </a>
                              )}
                            </div>

                            <div className="mt-3 space-y-1 text-sm text-zinc-500">
                              {submission.pdfFilename && <p>PDF: {submission.pdfFilename}</p>}
                              {submission.videoFilename && <p>Video: {submission.videoFilename}</p>}
                            </div>

                            <p className="text-sm text-zinc-500">
                              Registrada el{" "}
                              {new Date(submission.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Comentarios de evaluación
                  </label>

                  <textarea
                    rows={4}
                    value={commentDrafts[team.id] || ""}
                    onChange={(event) =>
                      handleCommentChange(team.id, event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                    placeholder="Escribe aquí la retroalimentación del equipo"
                  />

                  {activeTab === "PENDING" && (
                    <button
                      onClick={() => handleEvaluate(team.id)}
                      className="mt-4 rounded-xl bg-zinc-900 px-5 py-3 text-white transition hover:opacity-90"
                    >
                      Guardar evaluación
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}