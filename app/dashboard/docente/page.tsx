"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SimpleToast from "@/components/SimpleToast";
import {
  FormField,
  inputClassName,
  PrimaryButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { getOngCategoryStyle } from "@/lib/ongCategories";

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

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-zinc-900">
        {value || "No disponible"}
      </p>
    </div>
  );
}

function FileCard({
  href,
  title,
  filename,
  type,
}: {
  href?: string | null;
  title: string;
  filename?: string | null;
  type: "pdf" | "video";
}) {
  if (!href) return null;

  const isPdf = type === "pdf";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-[#2e5090] hover:shadow-sm"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${isPdf ? "bg-red-50" : "bg-[#2e5090]/10 text-[#2e5090]"
            }`}
        >
          {isPdf ? "📄" : "▶"}
        </div>

        <div className="min-w-0">
          <p className="font-black text-zinc-900">{title}</p>
          <p className="truncate text-sm text-zinc-500">
            {filename || "Ver archivo"}
          </p>
        </div>
      </div>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition group-hover:bg-[#2e5090] group-hover:text-white">
        ↗
      </span>
    </a>
  );
}

export default function DocenteDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEWED">("PENDING");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const pendingTeams = useMemo(
    () => teams.filter((team) => (team.evaluation?.status || "PENDING") === "PENDING"),
    [teams]
  );

  const reviewedTeams = useMemo(
    () => teams.filter((team) => team.evaluation?.status === "REVIEWED"),
    [teams]
  );

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
    setSuccessMessage("");
    setErrorMessage("");

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
        setSuccessMessage("Evaluación guardada correctamente.");
        await fetchTeacherTeams(user.id);
      } else {
        setErrorMessage(result.message || "No se pudo guardar la evaluación.");
      }
    } catch (error) {
      console.error("Error al evaluar equipo:", error);
      setErrorMessage("Ocurrió un error al guardar la evaluación.");
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
      navItems={[{ label: "Panel docente", href: "/dashboard/docente" }]}
    >
      <div className="space-y-8">
        <div className="space-y-3">
          {successMessage && (
            <SimpleToast message={successMessage} type="success" />
          )}

          {errorMessage && <SimpleToast message={errorMessage} type="error" />}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <SectionCard className="border-l-4 border-l-[#2e5090]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
              Sala asignada
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {room?.name || "Sin sala"}
            </p>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#f88f03]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f88f03]">
              Pendientes
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {pendingTeams.length}
            </p>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#009e51]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#009e51]">
              Evaluados
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {reviewedTeams.length}
            </p>
          </SectionCard>
        </section>

        <SectionCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                Evaluación de equipos
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Equipos asignados
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "PENDING"
                    ? "bg-[#f88f03] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
              >
                Pendientes ({pendingTeams.length})
              </button>

              <button
                onClick={() => setActiveTab("REVIEWED")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "REVIEWED"
                    ? "bg-[#009e51] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
              >
                Evaluados ({reviewedTeams.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">Cargando equipos...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">
                No hay equipos en esta vista.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Cambia de pestaña o espera a que existan entregas asignadas.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {filteredTeams.map((team) => {
                const categoryStyle = getOngCategoryStyle(team.category);
                const status = team.evaluation?.status || "PENDING";

                return (
                  <article
                    key={team.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm"
                  >
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: categoryStyle.color }}
                    />

                    <div className="space-y-6 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            Equipo
                          </p>
                          <h3 className="mt-2 text-2xl font-black text-zinc-900">
                            {team.teamName}
                          </h3>
                          <p className="mt-2 text-sm text-zinc-600">
                            {team.projectName}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                          >
                            {categoryStyle.label}
                          </span>

                          <StatusBadge
                            tone={status === "REVIEWED" ? "success" : "warning"}
                          >
                            {status === "REVIEWED" ? "Evaluado" : "Pendiente"}
                          </StatusBadge>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <MiniInfo label="Representante" value={team.user.name} />
                        <MiniInfo label="Correo" value={team.user.email} />
                        <MiniInfo label="Integrantes" value={team.members} />
                      </div>

                      <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                        <p className="text-sm font-black text-zinc-900">
                          Entregas del equipo
                        </p>

                        {team.submissions.length === 0 ? (
                          <p className="mt-3 text-sm text-zinc-600">
                            Este equipo aún no ha registrado entregas.
                          </p>
                        ) : (
                          <div className="mt-4 space-y-4">
                            {team.submissions.map((submission) => (
                              <div
                                key={submission.id}
                                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <p className="font-black text-zinc-900">
                                      {submission.title}
                                    </p>

                                    {submission.description && (
                                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                                        {submission.description}
                                      </p>
                                    )}
                                  </div>

                                  <p className="text-xs font-semibold text-zinc-400">
                                    {new Date(
                                      submission.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                  <FileCard
                                    type="pdf"
                                    title="Documento PDF"
                                    href={submission.pdfUrl}
                                    filename={submission.pdfFilename}
                                  />

                                  <FileCard
                                    type="video"
                                    title="Video de presentación"
                                    href={submission.videoUrl}
                                    filename={submission.videoFilename}
                                  />

                                  {!submission.pdfUrl &&
                                    !submission.videoUrl &&
                                    submission.publicLink && (
                                      <a
                                        href={submission.publicLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-2xl bg-[#2e5090] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                      >
                                        Ver entrega
                                      </a>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                        <FormField label="Comentarios de evaluación">
                          <textarea
                            rows={4}
                            value={commentDrafts[team.id] || ""}
                            onChange={(event) =>
                              handleCommentChange(team.id, event.target.value)
                            }
                            className={inputClassName}
                            placeholder="Escribe aquí la retroalimentación del equipo"
                          />
                        </FormField>

                        {activeTab === "PENDING" && (
                          <div className="mt-4">
                            <PrimaryButton
                              type="button"
                              onClick={() => handleEvaluate(team.id)}
                            >
                              Guardar evaluación
                            </PrimaryButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}