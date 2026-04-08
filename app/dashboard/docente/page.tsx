"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function DocenteDashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
        <button
        onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }}
        className="rounded-xl bg-black px-4 py-2 text-white"
        >
        Cerrar sesión
        </button>
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Docente
        </h1>

        {!user ? (
          <p className="mt-4 text-gray-600">Cargando datos del usuario...</p>
        ) : (
          <div className="mt-8 space-y-3">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
            <p><strong>Estado:</strong> {user.status}</p>
          </div>
        )}
      </div>
    </main>
  );
}