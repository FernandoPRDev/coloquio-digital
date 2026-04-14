"use client";

import { FormEvent, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";

export default function RegistroPage() {
  const [teamName, setTeamName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [members, setMembers] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    const formData = {
      teamName,
      representativeName,
      email,
      password,
      projectName,
      category,
      members,
    };

    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMessage("Solicitud enviada correctamente.");

        setTeamName("");
        setRepresentativeName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setProjectName("");
        setCategory("");
        setMembers("");
      } else {
        setErrorMessage(result.message || "Ocurrió un error al registrarte.");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setErrorMessage("Ocurrió un error al enviar el formulario.");
    }
  };

  return (
    <PublicLayout>
      <section className="px-4 py-10 lg:px-6 lg:py-14">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            Registro de equipo
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Completa la información para solicitar acceso al sistema del coloquio.
          </p>

          <div className="mt-6 space-y-3">
            {successMessage && <SimpleToast message={successMessage} type="success" />}
            {errorMessage && <SimpleToast message={errorMessage} type="error" />}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Nombre del equipo
              </label>
              <input
                type="text"
                placeholder="Ej. Creativos UV"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Nombre del representante
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={representativeName}
                onChange={(event) => setRepresentativeName(event.target.value)}
                autoComplete="name"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Escribe una contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Debe tener al menos 8 caracteres.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="Vuelve a escribir tu contraseña"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Nombre del proyecto
              </label>
              <input
                type="text"
                placeholder="Ej. Estrategias de comunicación digital"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Categoría
              </label>
              <input
                type="text"
                placeholder="Ej. Publicidad / Relaciones Públicas"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Integrantes
              </label>
              <textarea
                rows={4}
                placeholder="Escribe los nombres de los integrantes separados por coma"
                value={members}
                onChange={(event) => setMembers(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-white transition hover:opacity-90"
            >
              Enviar solicitud
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}