"use client";

import SimpleToast from "@/components/SimpleToast";
import { useEffect, useState } from "react";

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

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleApprove = async (userId: string) => {
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
        alert("Usuario aprobado correctamente");
        fetchPendingUsers();
      } else {
        alert(result.message || "No se pudo aprobar el usuario");
      }
    } catch (error) {
      console.error("Error al aprobar usuario:", error);
      alert("Ocurrió un error al aprobar el usuario");
    }
  };

  const handleReject = async (userId: string) => {
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
        alert("Registro rechazado y eliminado correctamente");
        fetchPendingUsers();
        fetchRooms();
        fetchAllSubmissions();
      } else {
        alert(result.message || "No se pudo rechazar el usuario");
      }
    } catch (error) {
      console.error("Error al rechazar usuario:", error);
      alert("Ocurrió un error al rechazar el usuario");
    }
  };

  const handleCreateTeacher = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

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

      if (!response.ok) {
        const text = await response.text();

        console.error(
          "Error HTTP al crear docente:",
          response.status,
          text
        );

        alert("Ocurrió un error al crear el docente");
        return;
      }

      const result = await response.json();

      if (result.ok) {
        alert("Docente creado correctamente");

        setTeacherName("");
        setTeacherEmail("");
        setTeacherPassword("");
        setSelectedRoomId("");

        fetchRooms();
      } else {
        alert(result.message || "No se pudo crear el docente");
      }
    } catch (error) {
      console.error("Error al crear docente:", error);
      alert("Ocurrió un error al crear el docente");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            {user && (
              <p className="mt-2 text-sm text-gray-600">
                Sesión iniciada como {user.name} ({user.email})
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-black px-4 py-2 text-white transition hover:opacity-90"
          >
            Cerrar sesión
          </button>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Usuarios pendientes de aprobación
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No hay usuarios pendientes por aprobar.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div
                  key={pendingUser.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Representante</p>
                      <p className="font-semibold text-gray-900">
                        {pendingUser.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Correo</p>
                      <p className="font-semibold text-gray-900">
                        {pendingUser.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Equipo</p>
                      <p className="font-semibold text-gray-900">
                        {pendingUser.team?.teamName || "Sin equipo"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Proyecto</p>
                      <p className="font-semibold text-gray-900">
                        {pendingUser.team?.projectName || "Sin proyecto"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Categoría</p>
                      <p className="font-semibold text-gray-900">
                        {pendingUser.team?.category || "Sin categoría"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                        {pendingUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(pendingUser.id)}
                      className="rounded-xl bg-black px-4 py-2 text-white transition hover:opacity-90"
                    >
                      Aprobar usuario
                    </button>

                    <button
                      onClick={() => handleReject(pendingUser.id)}
                      className="rounded-xl border border-red-600 px-4 py-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Rechazar usuario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Entregas registradas por los equipos
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-600">Cargando entregas...</p>
          ) : submissions.length === 0 ? (
            <p className="mt-4 text-gray-600">
              Aún no hay entregas registradas por los equipos.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Título de la entrega</p>
                      <p className="font-semibold text-gray-900">
                        {submission.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Equipo</p>
                      <p className="font-semibold text-gray-900">
                        {submission.team.teamName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Proyecto</p>
                      <p className="font-semibold text-gray-900">
                        {submission.team.projectName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Categoría</p>
                      <p className="font-semibold text-gray-900">
                        {submission.team.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Representante</p>
                      <p className="font-semibold text-gray-900">
                        {submission.team.user.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Correo</p>
                      <p className="font-semibold text-gray-900">
                        {submission.team.user.email}
                      </p>
                    </div>
                  </div>

                  {submission.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Descripción</p>
                      <p className="text-gray-700">{submission.description}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {submission.pdfUrl && (
                        <a
                          href={submission.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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
                          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                          Ver entrega
                        </a>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-zinc-500">
                      {submission.pdfFilename && <p>PDF: {submission.pdfFilename}</p>}
                      {submission.videoFilename && <p>Video: {submission.videoFilename}</p>}
                    </div>

                    <p className="text-sm text-gray-500">
                      Registrada el{" "}
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Salas y docentes asignados
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-600">Cargando salas...</p>
          ) : rooms.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No hay salas registradas.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h3>

                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                      {room.teams.length} equipos
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Docente asignado</p>

                    {room.teachers.length > 0 ? (
                      <div className="mt-2">
                        <p className="font-semibold text-gray-900">
                          {room.teachers[0].name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {room.teachers[0].email}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-orange-600">
                        Sin docente asignado
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Equipos</p>

                    {room.teams.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-600">
                        No hay equipos asignados aún.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        {room.teams.map((team) => (
                          <li
                            key={team.id}
                            className="rounded-lg bg-zinc-50 px-3 py-2"
                          >
                            <span className="font-medium">{team.teamName}</span>
                            {" — "}
                            {team.projectName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Crear docente y asignar sala
          </h2>

          <form
            className="mt-4 space-y-4 rounded-xl border border-gray-200 p-6"
            onSubmit={handleCreateTeacher}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Nombre del docente
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(event) => setTeacherEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(event) => setTeacherPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Sala
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
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
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90"
            >
              Crear docente
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}