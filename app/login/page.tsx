"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.ok) {
  alert("Login correcto");

  localStorage.setItem("user", JSON.stringify(result.user));

  if (result.user.role === "TEAM") {
    router.push("/dashboard/equipo");
  } else if (result.user.role === "ADMIN") {
    router.push("/dashboard/admin");
  } else if (result.user.role === "TEACHER") {
    router.push("/dashboard/docente");
  }
} else {
        alert(result.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Ingresa con tu correo y contraseña.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}