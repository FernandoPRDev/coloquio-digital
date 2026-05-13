"use client";

"use client";

import { FormEvent, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
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
  pdfFilename?: string | null;

  presentationPdfUrl?: string | null;
  presentationPdfFilename?: string | null;

  videoUrl?: string | null;
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
      className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-[#2e5090] hover:bg-white hover:shadow-sm"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${isPdf
            ? "bg-red-50 text-red-600"
            : "bg-[#2e5090]/10 text-[#2e5090]"
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

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-400 transition group-hover:bg-[#2e5090] group-hover:text-white">
        ↗
      </span>
    </a>
  );
}

function InfoCard({
  label,
  value,
  accent = "blue",
}: {
  label: string;
  value?: string | null;
  accent?: "blue" | "green" | "orange" | "neutral";
}) {
  const accents = {
    blue: "bg-[#2e5090]/10 text-[#2e5090]",
    green: "bg-[#009e51]/10 text-[#009e51]",
    orange: "bg-[#f88f03]/10 text-[#f88f03]",
    neutral: "bg-zinc-100 text-zinc-600",
  };

  return (
    <div className="group min-w-0 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 break-words text-base font-black text-zinc-900">
            {value || "No disponible"}
          </p>
        </div>

        <div
          className={`h-3 w-3 shrink-0 rounded-full ${accents[accent]}`}
        />
      </div>
    </div>
  );
}
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

  const [presentationPdfFile, setPresentationPdfFile] = useState<File | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState("");

  const [submissionDeadline, setSubmissionDeadline] = useState<string | null>(null);
  const isSubmissionDeadlinePassed = submissionDeadline
    ? new Date() > new Date(submissionDeadline)
    : false;
  const fetchPublicSettings = async () => {
    try {
      const response = await fetch("/api/settings-public");
      const result = await response.json();

      if (result.ok) {
        setSubmissionDeadline(result.settings?.submissionDeadline || null);
      }
    } catch (error) {
      console.error("Error al cargar configuración pública:", error);
    }
  };

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
          setPdfFile(null);
          setPresentationPdfFile(null);
          setVideoFile(null);
        } else {
          setTitle("");
          setDescription("");
          setPdfFile(null);
          setPresentationPdfFile(null);
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
        await fetchPublicSettings();
      } catch (error) {
        console.error("Error al cargar sesión equipo:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const uploadFileToBlob = async (
    file: File,
    fileType: "pdf" | "presentationPdf" | "video",
    teamId: string
  ) => {
    const safeFileName = file.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.\-_]/g, "");

    const blob = await upload(
      `submissions/${teamId}/${fileType}-${Date.now()}-${safeFileName}`,
      file,
      {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({
          fileType,
          originalType: file.type,
          originalName: file.name,
        }),
        multipart: true,
      }
    );

    return blob;
  };

  const handleSubmitSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!team) return;

    setUploadError("");
    setUploadSuccess("");
    setUploadProgressText("");
    setIsSubmitting(true);

    try {
      const existingSubmission = team.submissions[0];

      if (
        !existingSubmission &&
        (!pdfFile || !presentationPdfFile || !videoFile)
      ) {
        setUploadError(
          "Debes seleccionar el PDF principal, el PDF de presentación y el video."
        );
        setIsSubmitting(false);
        return;
      }

      let pdfBlob: { url: string } | null = null;
      let presentationPdfBlob: { url: string } | null = null;
      let videoBlob: { url: string } | null = null;

      if (pdfFile) {
        setUploadProgressText("Subiendo PDF principal...");
        pdfBlob = await uploadFileToBlob(pdfFile, "pdf", team.id);
      }

      if (presentationPdfFile) {
        setUploadProgressText("Subiendo PDF de presentación...");
        presentationPdfBlob = await uploadFileToBlob(
          presentationPdfFile,
          "presentationPdf",
          team.id
        );
      }

      if (videoFile) {
        setUploadProgressText("Subiendo video...");
        videoBlob = await uploadFileToBlob(videoFile, "video", team.id);
      }

      setUploadProgressText("Guardando entrega...");

      const response = await fetch("/api/submissions/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          teamId: team.id,

          pdfUrl: pdfBlob?.url,
          pdfFilename: pdfFile?.name,

          presentationPdfUrl: presentationPdfBlob?.url,
          presentationPdfFilename: presentationPdfFile?.name,

          videoUrl: videoBlob?.url,
          videoFilename: videoFile?.name,
        }),
      });

      const result = await response.json();

      if (result.ok && user) {
        setUploadSuccess("Entrega guardada correctamente.");
        setPdfFile(null);
        setPresentationPdfFile(null);
        setVideoFile(null);
        setUploadProgressText("");

        await fetchTeamData(user.id);
      } else {
        setUploadError(result.message || "No se pudo guardar la entrega.");
      }
    } catch (error) {
      console.error("Error al guardar entrega:", error);
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
          <SectionCard>
            <h2 className="text-xl font-black text-zinc-900">
              Información del usuario
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Nombre" value={user?.name} />
              <InfoCard label="Correo" value={user?.email} />
              <InfoCard label="Rol" value={user?.role} />

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Estado</p>
                <div className="mt-2">
                  <StatusBadge tone="success">Activo</StatusBadge>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <h2 className="text-xl font-black text-zinc-900">
              Información del equipo
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Equipo" value={team.teamName} />
              <InfoCard label="Proyecto" value={team.projectName} />

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Categoría de ONG</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getOngCategoryStyle(team.category).bg
                      } ${getOngCategoryStyle(team.category).border} ${getOngCategoryStyle(team.category).text
                      }`}
                  >
                    {getOngCategoryStyle(team.category).label}
                  </span>
                </div>
              </div>

              <InfoCard label="Sala" value={team.room?.name} />
            </div>

            <div className="mt-4">
              <InfoCard label="Integrantes" value={team.members} />
            </div>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#009e51]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#009e51]">
                  Seguimiento docente
                </p>

                <h2 className="mt-2 text-xl font-black text-zinc-900">
                  Estado de evaluación
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Aquí podrás consultar si tu entrega ya fue revisada y leer los comentarios del docente.
                </p>
              </div>

              <StatusBadge
                tone={team.evaluation?.status === "REVIEWED" ? "success" : "warning"}
              >
                {team.evaluation?.status === "REVIEWED" ? "Evaluado" : "Pendiente"}
              </StatusBadge>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${team.evaluation?.status === "REVIEWED"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                    }`}
                >
                  {team.evaluation?.status === "REVIEWED" ? "✓" : "!"}
                </div>

                <div>
                  <p className="font-black text-zinc-900">
                    Comentarios del docente
                  </p>

                  {team.evaluation?.comments ? (
                    <p className="mt-2 leading-6 text-zinc-700">
                      {team.evaluation.comments}
                    </p>
                  ) : (
                    <p className="mt-2 leading-6 text-zinc-500">
                      Aún no hay comentarios registrados para este equipo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#2e5090]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2e5090]/10 text-xl text-[#2e5090]">
                ⏱
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                  Periodo de entrega
                </p>

                <h2 className="mt-2 text-xl font-black text-zinc-900">
                  Fecha límite de entrega
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Puedes registrar o actualizar tu entrega hasta el{" "}
                  <span className="font-black text-zinc-900">
                    {submissionDeadline
                      ? new Date(submissionDeadline).toLocaleString()
                      : "sin fecha límite configurada"}
                  </span>
                  . Una vez evaluada tu entrega o pasada esta fecha, ya no será posible
                  modificarla.
                </p>
              </div>
            </div>
          </SectionCard>

          {team.evaluation?.status !== "REVIEWED" && !isSubmissionDeadlinePassed ? (
            <SectionCard className="border-l-4 border-l-[#2e5090]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                    Entrega del proyecto
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-zinc-900">
                    {team.submissions.length > 0
                      ? "Actualizar entrega"
                      : "Registrar entrega"}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                    Sube el documento PDF y el video de presentación de tu proyecto. Si ya
                    existe una entrega, puedes actualizar solo el texto o reemplazar los
                    archivos.
                  </p>
                </div>

                <StatusBadge tone={team.submissions.length > 0 ? "success" : "warning"}>
                  {team.submissions.length > 0 ? "Entrega cargada" : "Pendiente"}
                </StatusBadge>
              </div>

              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-800">
                  Consideraciones importantes
                </p>
                <p className="mt-1 text-sm leading-6 text-orange-700">
                  Si no seleccionas nuevos archivos, se conservarán los archivos actuales.
                  Una vez evaluada la entrega o pasada la fecha límite, ya no podrás
                  modificarla.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {uploadProgressText && (
                  <SimpleToast message={uploadProgressText} type="success" />
                )}

                {uploadSuccess && (
                  <SimpleToast message={uploadSuccess} type="success" />
                )}

                {uploadError && (
                  <SimpleToast message={uploadError} type="error" />
                )}
              </div>

              <form
                className="mt-6 space-y-6"
                onSubmit={handleSubmitSubmission}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Título de la entrega">
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      className={inputClassName}
                      placeholder="Ej. Estrategia de comunicación para ONG ambiental"
                    />
                  </FormField>

                  <FormField label="Descripción">
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className={inputClassName}
                      placeholder="Describe brevemente en qué consiste la entrega..."
                    />
                  </FormField>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Documento PDF"
                    helpText="Formato permitido: PDF. Tamaño máximo: 50 MB."
                  >
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center transition hover:border-[#2e5090] hover:bg-[#2e5090]/5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                        📄
                      </div>

                      <p className="mt-4 text-sm font-bold text-zinc-900">
                        {pdfFile ? pdfFile.name : "Selecciona un PDF"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Haz clic para cargar o reemplazar el archivo
                      </p>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setPdfFile(file);
                        }}
                        required={!team.submissions[0]?.pdfUrl}
                        className="hidden"
                      />
                    </label>

                    {team.submissions[0]?.pdfUrl && (
                      <a
                        href={team.submissions[0].pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-[#2e5090] underline underline-offset-4"
                      >
                        Ver PDF actual
                      </a>
                    )}
                  </FormField>

                  <FormField
                    label="PDF de presentación"
                    helpText="Formato permitido: PDF. Tamaño máximo: 50 MB."
                  >
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center transition hover:border-[#2e5090] hover:bg-[#2e5090]/5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f88f03]/10 text-2xl text-[#f88f03]">
                        📑
                      </div>

                      <p className="mt-4 text-sm font-bold text-zinc-900">
                        {presentationPdfFile
                          ? presentationPdfFile.name
                          : "Selecciona el PDF de presentación"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Haz clic para cargar o reemplazar el archivo
                      </p>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setPresentationPdfFile(file);
                        }}
                        required={!team.submissions[0]?.presentationPdfUrl}
                        className="hidden"
                      />
                    </label>

                    {team.submissions[0]?.presentationPdfUrl && (
                      <a
                        href={team.submissions[0].presentationPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-[#2e5090] underline underline-offset-4"
                      >
                        Ver PDF de presentación actual
                      </a>
                    )}
                  </FormField>

                  <FormField
                    label="Video de presentación"
                    helpText="Formatos permitidos: MP4, WEBM o MOV. Tamaño máximo: 400 MB. De preferencia MP4 para mejor compatibilidad."
                  >
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center transition hover:border-[#2e5090] hover:bg-[#2e5090]/5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2e5090]/10 text-2xl text-[#2e5090]">
                        ▶
                      </div>

                      <p className="mt-4 text-sm font-bold text-zinc-900">
                        {videoFile ? videoFile.name : "Selecciona un video"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Haz clic para cargar o reemplazar el archivo
                      </p>

                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setVideoFile(file);
                        }}
                        required={!team.submissions[0]?.videoUrl}
                        className="hidden"
                      />
                    </label>

                    {team.submissions[0]?.videoUrl && (
                      <a
                        href={team.submissions[0].videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-[#2e5090] underline underline-offset-4"
                      >
                        Ver video actual
                      </a>
                    )}
                  </FormField>
                </div>

                <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-500">
                    Revisa que tu entrega esté completa antes de enviarla.
                  </p>

                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : team.submissions.length > 0
                        ? "Actualizar entrega"
                        : "Guardar entrega"}
                  </PrimaryButton>
                </div>
              </form>
            </SectionCard>
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

          <SectionCard className="border-l-4 border-l-[#f88f03]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f88f03]">
                  Historial de entrega
                </p>

                <h2 className="mt-2 text-xl font-black text-zinc-900">
                  Entregas registradas
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Aquí puedes consultar los archivos y detalles de la entrega actual de tu equipo.
                </p>
              </div>

              <StatusBadge tone={team.submissions.length > 0 ? "success" : "warning"}>
                {team.submissions.length > 0 ? "Con entrega" : "Sin entrega"}
              </StatusBadge>
            </div>

            {team.submissions.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                <p className="text-lg font-black text-zinc-900">
                  Aún no hay entregas registradas
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Cuando guardes tu PDF y video, aparecerán aquí para consulta.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {team.submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                  >
                    <div className="h-2 w-full bg-[#f88f03]" />

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Entrega
                          </p>

                          <h3 className="mt-2 break-words text-xl font-black text-zinc-900">
                            {submission.title}
                          </h3>

                          {submission.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                              {submission.description}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Registrada
                          </p>
                          <p className="mt-1 text-sm font-bold text-zinc-700">
                            {new Date(submission.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-1">
                        <div className="mt-5 grid gap-4 md:grid-cols-1">
                          <FileCard
                            type="pdf"
                            title="PDF principal"
                            href={submission.pdfUrl}
                            filename={submission.pdfFilename}
                          />

                          <FileCard
                            type="pdf"
                            title="PDF de presentación"
                            href={submission.presentationPdfUrl}
                            filename={submission.presentationPdfFilename}
                          />

                          <FileCard
                            type="video"
                            title="Video de presentación"
                            href={submission.videoUrl}
                            filename={submission.videoFilename}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}