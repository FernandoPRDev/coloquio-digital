"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SimpleToast from "@/components/SimpleToast";
import {
  FormField,
  inputClassName,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { getOngCategoryStyle } from "@/lib/ongCategories";

type Team = {
  id: string;
  teamName: string;
  projectName: string;
  category: string;
  members: string;
};

type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  team: Team | null;
};

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  team: {
    id: string;
    teamName: string;
    projectName: string;
    category: string;
    members: string;
    room?: {
      id: string;
      name: string;
    } | null;
    submissions: Submission[];
    publicComments: {
      id: string;
    }[];
    evaluation?: {
      id: string;
      status: string;
    } | null;
  } | null;
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
  team: {
    id: string;
    teamName: string;
    projectName: string;
    category: string;
    user: {
      name: string;
      email: string;
    };
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Room = {
  id: string;
  name: string;
  teams: {
    id: string;
    teamName: string;
    projectName: string;
    category: string;
    user: {
      name: string;
      email: string;
    };
  }[];
  teachers: {
    id: string;
    name: string;
    email: string;
  }[];
};

type EventSettings = {
  id: string;
  submissionDeadline?: string | null;
  expositionOpenAt?: string | null;
  expositionEnabled: boolean;
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

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [expositionOpenAt, setExpositionOpenAt] = useState("");
  const [expositionEnabled, setExpositionEnabled] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const formatForDateTimeLocal = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("/api/admin/usuarios-activos");
      const result = await response.json();

      if (result.ok) {
        setActiveUsers(result.users);
      }
    } catch (error) {
      console.error("Error al cargar usuarios activos:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const result = await response.json();

      if (result.ok) {
        setSettings(result.settings);
        setSubmissionDeadline(
          formatForDateTimeLocal(result.settings.submissionDeadline)
        );
        setExpositionOpenAt(
          formatForDateTimeLocal(result.settings.expositionOpenAt)
        );
        setExpositionEnabled(result.settings.expositionEnabled);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/admin/pendientes");

      if (!response.ok) {
        console.error("Error HTTP:", response.status);
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setPendingUsers(result.users);
      }
    } catch (error) {
      console.error("Error al cargar usuarios pendientes:", error);
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/entregas");

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

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/admin/salas");

      if (!response.ok) {
        console.error("Error HTTP al cargar salas:", response.status);
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setRooms(result.rooms);
      }
    } catch (error) {
      console.error("Error al cargar salas:", error);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!result.ok || result.user.role !== "ADMIN") {
          window.location.href = "/login";
          return;
        }

        setUser(result.user);

        await Promise.all([
          fetchPendingUsers(),
          fetchAllSubmissions(),
          fetchRooms(),
          fetchSettings(),
          fetchActiveUsers(),
        ]);
      } catch (error) {
        console.error("Error al cargar sesión admin:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);


  const handleApprove = async (userId: string) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/aprobar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Usuario aprobado correctamente.");
        await Promise.all([fetchPendingUsers(), fetchRooms()]);
      } else {
        setErrorMessage(result.message || "No se pudo aprobar el usuario.");
      }
    } catch (error) {
      console.error("Error al aprobar usuario:", error);
      setErrorMessage("Ocurrió un error al aprobar el usuario.");
    }
  };

  const handleDeleteActiveUser = async (userId: string) => {
    const confirmed = confirm(
      "¿Seguro que deseas eliminar este usuario activo? Se eliminará su equipo, entregas, evaluación y comentarios públicos."
    );

    if (!confirmed) return;

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/eliminar-usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Usuario activo eliminado correctamente.");

        await Promise.all([
          fetchActiveUsers(),
          fetchPendingUsers(),
          fetchRooms(),
          fetchAllSubmissions(),
        ]);
      } else {
        setErrorMessage(result.message || "No se pudo eliminar el usuario.");
      }
    } catch (error) {
      console.error("Error al eliminar usuario activo:", error);
      setErrorMessage("Ocurrió un error al eliminar el usuario.");
    }
  };

  const handleReject = async (userId: string) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/rechazar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Registro rechazado y eliminado correctamente.");
        await Promise.all([fetchPendingUsers(), fetchRooms(), fetchAllSubmissions()]);
      } else {
        setErrorMessage(result.message || "No se pudo rechazar el usuario.");
      }
    } catch (error) {
      console.error("Error al rechazar usuario:", error);
      setErrorMessage("Ocurrió un error al rechazar el usuario.");
    }
  };

  const handleSaveSettings = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionDeadline,
          expositionOpenAt,
          expositionEnabled,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Configuración del evento guardada correctamente.");
        setSettings(result.settings);
      } else {
        setErrorMessage(result.message || "No se pudo guardar la configuración.");
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setErrorMessage("Ocurrió un error al guardar la configuración.");
    }
  };

  const handleCreateTeacher = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/docentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword,
          roomId: selectedRoomId,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Docente creado correctamente.");

        setTeacherName("");
        setTeacherEmail("");
        setTeacherPassword("");
        setSelectedRoomId("");

        await fetchRooms();
      } else {
        setErrorMessage(result.message || "No se pudo crear el docente.");
      }
    } catch (error) {
      console.error("Error al crear docente:", error);
      setErrorMessage("Ocurrió un error al crear el docente.");
    }
  };

  return (
    <DashboardLayout
      userName={user?.name}
      userEmail={user?.email}
      title="Dashboard Admin"
      subtitle="Gestiona usuarios, salas, docentes, entregas y configuración general del evento."
      navTitle="Admin"
      navItems={[{ label: "Panel admin", href: "/dashboard/admin" }]}
    >
      <div className="space-y-8">
        <div className="space-y-3">
          {successMessage && (
            <SimpleToast message={successMessage} type="success" />
          )}

          {errorMessage && <SimpleToast message={errorMessage} type="error" />}
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <SectionCard className="border-l-4 border-l-[#f88f03]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f88f03]">
              Pendientes
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {pendingUsers.length}
            </p>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#2e5090]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
              Entregas
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {submissions.length}
            </p>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-[#009e51]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#009e51]">
              Salas
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {rooms.length}
            </p>
          </SectionCard>

          <SectionCard className="border-l-4 border-l-zinc-900">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Exposición
            </p>
            <p className="mt-3 text-2xl font-black text-zinc-900">
              {expositionEnabled ? "Activa" : "Inactiva"}
            </p>
          </SectionCard>
        </section>

        <SectionCard className="border-l-4 border-l-[#2e5090]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                Configuración
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Configuración del evento
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Controla la fecha límite de entrega y la disponibilidad pública
                de la exposición.
              </p>
            </div>

            <StatusBadge tone={expositionEnabled ? "success" : "danger"}>
              {expositionEnabled ? "Exposición activa" : "Exposición inactiva"}
            </StatusBadge>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSaveSettings}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Fecha límite de entrega"
                helpText="Después de esta fecha, los equipos ya no podrán subir ni actualizar entregas."
              >
                <input
                  type="datetime-local"
                  value={submissionDeadline}
                  onChange={(event) => setSubmissionDeadline(event.target.value)}
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label="Fecha de apertura de exposición"
                helpText="Antes de esta fecha, la página pública de exposición no mostrará proyectos."
              >
                <input
                  type="datetime-local"
                  value={expositionOpenAt}
                  onChange={(event) => setExpositionOpenAt(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                checked={expositionEnabled}
                onChange={(event) => setExpositionEnabled(event.target.checked)}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-bold text-zinc-900">
                  Exposición activa
                </span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Si está desactivada, la página de exposición permanecerá
                  oculta aunque ya haya llegado la fecha de apertura.
                </span>
              </span>
            </label>

            <PrimaryButton type="submit">Guardar configuración</PrimaryButton>
          </form>
        </SectionCard>

        <SectionCard className="border-l-4 border-l-[#f88f03]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f88f03]">
                Aprobaciones
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Usuarios pendientes
              </h2>
            </div>

            <StatusBadge tone={pendingUsers.length > 0 ? "warning" : "success"}>
              {pendingUsers.length} pendiente(s)
            </StatusBadge>
          </div>

          {loading ? (
            <p className="mt-6 text-zinc-600">Cargando usuarios...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">
                No hay usuarios pendientes por aprobar.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {pendingUsers.map((pendingUser) => {
                const categoryStyle = getOngCategoryStyle(
                  pendingUser.team?.category
                );

                return (
                  <article
                    key={pendingUser.id}
                    className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <MiniInfo label="Representante" value={pendingUser.name} />
                      <MiniInfo label="Correo" value={pendingUser.email} />
                      <MiniInfo
                        label="Equipo"
                        value={pendingUser.team?.teamName}
                      />
                      <MiniInfo
                        label="Proyecto"
                        value={pendingUser.team?.projectName}
                      />

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          Categoría
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                        >
                          {categoryStyle.label}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          Estado
                        </p>
                        <div className="mt-2">
                          <StatusBadge tone="warning">
                            {pendingUser.status}
                          </StatusBadge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <PrimaryButton
                        type="button"
                        onClick={() => handleApprove(pendingUser.id)}
                      >
                        Aprobar usuario
                      </PrimaryButton>

                      <button
                        onClick={() => handleReject(pendingUser.id)}
                        className="rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Rechazar usuario
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard className="border-l-4 border-l-red-500">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-500">
                Gestión de equipos
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Usuarios activos
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Elimina equipos ya aprobados junto con sus entregas, evaluaciones y comentarios.
              </p>
            </div>

            <StatusBadge tone="blue">{activeUsers.length} activo(s)</StatusBadge>
          </div>

          {loading ? (
            <p className="mt-6 text-zinc-600">Cargando usuarios activos...</p>
          ) : activeUsers.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">
                No hay usuarios activos registrados.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {activeUsers.map((activeUser) => {
                const categoryStyle = getOngCategoryStyle(activeUser.team?.category);

                return (
                  <article
                    key={activeUser.id}
                    className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <MiniInfo label="Representante" value={activeUser.name} />
                      <MiniInfo label="Correo" value={activeUser.email} />
                      <MiniInfo label="Equipo" value={activeUser.team?.teamName} />
                      <MiniInfo label="Proyecto" value={activeUser.team?.projectName} />
                      <MiniInfo label="Sala" value={activeUser.team?.room?.name} />

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          Categoría
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                        >
                          {categoryStyle.label}
                        </span>
                      </div>

                      <MiniInfo
                        label="Entregas"
                        value={String(activeUser.team?.submissions?.length || 0)}
                      />
                      <MiniInfo
                        label="Comentarios"
                        value={String(activeUser.team?.publicComments?.length || 0)}
                      />
                      <MiniInfo
                        label="Evaluación"
                        value={activeUser.team?.evaluation?.status || "PENDING"}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteActiveUser(activeUser.id)}
                        className="rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Eliminar usuario activo
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>


        <SectionCard className="border-l-4 border-l-[#2e5090]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                Entregas
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Entregas registradas
              </h2>
            </div>

            <StatusBadge tone={submissions.length > 0 ? "blue" : "neutral"}>
              {submissions.length} entrega(s)
            </StatusBadge>
          </div>

          {loading ? (
            <p className="mt-6 text-zinc-600">Cargando entregas...</p>
          ) : submissions.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">
                Aún no hay entregas registradas.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {submissions.map((submission) => {
                const categoryStyle = getOngCategoryStyle(
                  submission.team.category
                );

                return (
                  <article
                    key={submission.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm"
                  >
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: categoryStyle.color }}
                    />

                    <div className="space-y-5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            Entrega
                          </p>
                          <h3 className="mt-2 text-xl font-black text-zinc-900">
                            {submission.title}
                          </h3>
                          {submission.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                              {submission.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                        >
                          {categoryStyle.label}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <MiniInfo
                          label="Equipo"
                          value={submission.team.teamName}
                        />
                        <MiniInfo
                          label="Proyecto"
                          value={submission.team.projectName}
                        />
                        <MiniInfo
                          label="Representante"
                          value={submission.team.user.name}
                        />
                        <MiniInfo
                          label="Correo"
                          value={submission.team.user.email}
                        />
                        <MiniInfo
                          label="Registrada"
                          value={new Date(
                            submission.createdAt
                          ).toLocaleString()}
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
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
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard className="border-l-4 border-l-[#009e51]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#009e51]">
                Salas
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">
                Salas y docentes asignados
              </h2>
            </div>

            <StatusBadge tone="success">{rooms.length} sala(s)</StatusBadge>
          </div>

          {loading ? (
            <p className="mt-6 text-zinc-600">Cargando salas...</p>
          ) : rooms.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="font-bold text-zinc-900">No hay salas registradas.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {rooms.map((room) => (
                <article
                  key={room.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-zinc-900">
                      {room.name}
                    </h3>

                    <StatusBadge tone="blue">
                      {room.teams.length} equipo(s)
                    </StatusBadge>
                  </div>

                  <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                      Docente asignado
                    </p>

                    {room.teachers.length > 0 ? (
                      <div className="mt-2">
                        <p className="font-bold text-zinc-900">
                          {room.teachers[0].name}
                        </p>
                        <p className="break-words text-sm text-zinc-600">
                          {room.teachers[0].email}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-orange-600">
                        Sin docente asignado
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-black text-zinc-900">Equipos</p>

                    {room.teams.length === 0 ? (
                      <p className="mt-2 text-sm text-zinc-600">
                        No hay equipos asignados aún.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {room.teams.map((team) => {
                          const categoryStyle = getOngCategoryStyle(team.category);

                          return (
                            <li
                              key={team.id}
                              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-bold text-zinc-900">
                                    {team.teamName}
                                  </p>
                                  <p className="text-sm text-zinc-600">
                                    {team.projectName}
                                  </p>
                                </div>

                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                                >
                                  {categoryStyle.label}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard className="border-l-4 border-l-zinc-900">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Docentes
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-900">
              Crear docente y asignar sala
            </h2>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleCreateTeacher}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nombre del docente">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  required
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Correo electrónico">
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(event) => setTeacherEmail(event.target.value)}
                  required
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Contraseña">
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(event) => setTeacherPassword(event.target.value)}
                  required
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Sala">
                <select
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  required
                  className={inputClassName}
                >
                  <option value="">Selecciona una sala</option>
                  {rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                      disabled={room.teachers.length > 0}
                    >
                      {room.name}
                      {room.teachers.length > 0 ? " (ocupada)" : ""}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <PrimaryButton type="submit">Crear docente</PrimaryButton>
          </form>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}