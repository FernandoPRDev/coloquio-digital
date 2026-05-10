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
  user: User;
  submissions: Submission[];
  evaluation?: Evaluation | null;
};

const SUBMISSION_DEADLINE = new Date(
  process.env.NEXT_PUBLIC_SUBMISSION_DEADLINE ||
  "2026-05-20T23:59:00-06:00"
);

export default function EquipoDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmissionDeadlinePassed = new Date() > SUBMISSION_DEADLINE;

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
          setPdfFile(latestSubmission.pdfFilename || "");
          setVideoFile(latestSubmission.videoFilename || "");
        } else {
          setTitle("");
          setDescription("");
          setPdfFile(null);
          setVideoFile(null);
        }
      }
    } catch (error) {
      console.error("Error al cargar detalle del equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!result.ok || result.user.role !== "TEAM") {
          window.location.href = "/login";
          return;
        }

        setUser(result.user);
        await fetchTeamData(result.user.id);
      } catch (error) {
        console.error("Error al cargar sesión equipo:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleSubmitSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!team) return;

    setUploadError("");
    setUploadSuccess("");
    setIsSubmitting(true);

    if (!pdfFile && !videoFile && team.submissions.length === 0) {
      setUploadError("Debes seleccionar un PDF y un video.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("teamId", team.id);

    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }

    if (videoFile) {
      formData.append("videoFile", videoFile);
    }

    try {
      const response = await fetch("/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.ok && user) {
        setUploadSuccess("Entrega guardada correctamente.");
        setPdfFile(null);
        setVideoFile(null);

        await fetchTeamData(user.id);
      } else {
        setUploadError(result.message || "No se pudo guardar la entrega.");
      }
    } catch (error) {
      console.error("Error al enviar entrega:", error);
      setUploadError("Ocurrió un error al guardar la entrega.");
    } finally {
      setIsSubmitting(false);
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
                  className={`rounded-full px-3 py-1 text-sm font-medium ${team.evaluation?.status === "REVIEWED"
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

          <section>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <h2 className="text-lg font-semibold text-zinc-900">
                Fecha límite de entrega
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Puedes registrar o actualizar tu entrega hasta el{" "}
                <span className="font-semibold text-zinc-900">
                  {SUBMISSION_DEADLINE.toLocaleString()}
                </span>
                . Una vez evaluada tu entrega o pasada esta fecha, ya no será posible
                modificarla.
              </p>
            </div>
          </section>

          {team.evaluation?.status !== "REVIEWED" && !isSubmissionDeadlinePassed ? (

            <section>
              <h2 className="text-xl font-semibold text-zinc-900">
                Registrar entrega
              </h2>
              <div className="space-y-3">
                {uploadSuccess && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {uploadSuccess}
                  </div>
                )}

                {uploadError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {uploadError}
                  </div>
                )}

                <p className="text-sm text-zinc-500">
                  Si no seleccionas nuevos archivos, se conservarán los actuales.
                </p>
              </div>
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
                    PDF de la entrega
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setPdfFile(file);
                    }}
                    required={!team.submissions[0]?.pdfUrl}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Máximo 10 MB. Solo archivos PDF.
                  </p>

                  {team.submissions[0]?.pdfUrl && (
                    <a
                      href={team.submissions[0].pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-zinc-700 underline"
                    >
                      Ver PDF actual
                    </a>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Video de presentación
                  </label>

                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setVideoFile(file);
                    }}
                    required={!team.submissions[0]?.videoUrl}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Máximo 100 MB. Formatos: MP4, WEBM o MOV.
                  </p>

                  {team.submissions[0]?.videoUrl && (
                    <a
                      href={team.submissions[0].videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-zinc-700 underline"
                    >
                      Ver video actual
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-xl px-5 py-3 text-white transition ${isSubmitting
                    ? "cursor-not-allowed bg-zinc-400"
                    : "bg-zinc-900 hover:opacity-90"
                    }`}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : team.submissions.length > 0
                      ? "Actualizar entrega"
                      : "Guardar entrega"}
                </button>
              </form>
            </section>
          ) : (
            <section>
              <h2 className="text-xl font-semibold text-zinc-900">
                Entrega bloqueada
              </h2>

              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-medium text-orange-800">
                  Ya no es posible modificar la entrega.
                </p>
                <p className="mt-2 text-sm text-orange-700">
                  La entrega fue evaluada o la fecha límite de carga ya terminó.
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

                    {submission.pdfUrl && (
                      <a
                        href={submission.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        Ver PDF
                      </a>
                    )}

                    {submission.videoUrl && (
                      <a
                        href={submission.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 ml-3 inline-block rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                      >
                        Ver video
                      </a>
                    )}

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