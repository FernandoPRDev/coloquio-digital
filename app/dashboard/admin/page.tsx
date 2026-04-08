"use client";

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
  publicLink: string;
  createdAt: string;
  team: {
    id: string;
    teamName: string;
    projectName: string;
    category: string;
    members: string;
    user: {
      id: string;
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

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

  useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    window.location.href = "/login";
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  if (parsedUser.role !== "ADMIN") {
    window.location.href = "/login";
    return;
  }

  setUser(parsedUser);

  Promise.all([fetchPendingUsers(), fetchAllSubmissions()]).finally(() =>
    setLoading(false)
    );
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
      alert("Usuario rechazado correctamente");
      fetchPendingUsers();
    } else {
      alert(result.message || "No se pudo rechazar el usuario");
    }
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    alert("Ocurrió un error al rechazar el usuario");
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
                        <a
                        href={submission.publicLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-black px-4 py-2 text-white transition hover:opacity-90"
                        >
                        Ver entrega
                        </a>

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
      </div>
    </main>
  );
}