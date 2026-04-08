"use client";

import { FormEvent, useState } from "react";

export default function RegistroPage() {
  const [teamName, setTeamName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [members, setMembers] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

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

    console.log("Respuesta de la API:");
    console.table(result);

    if (result.ok) {
      alert("Solicitud enviada correctamente a la API.");

        setTeamName("");
        setRepresentativeName("");
        setEmail("");
        setPassword("");
        setProjectName("");
        setCategory("");
        setMembers("");
    } else {
      alert("La API respondió con un error.");
    }
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    alert("Ocurrió un error al enviar el formulario.");
  }
};

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Registro de equipo
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Completa la información para solicitar acceso al sistema del coloquio.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Nombre del equipo
            </label>
            <input
              type="text"
              placeholder="Ej. Creativos UV"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Nombre del representante
            </label>
            <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={representativeName}
                onChange={(event) => setRepresentativeName(event.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
          </div>

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
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Contraseña
            </label>
            <input
                type="password"
                placeholder="Escribe una contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Nombre del proyecto
            </label>
            <input
              type="text"
              placeholder="Ej. Estrategias de comunicación digital"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"

            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Categoría
            </label>
            <input
              type="text"
              placeholder="Ej. Publicidad / Relaciones Públicas"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"

            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Integrantes
            </label>
            <textarea
              rows={4}
              placeholder="Escribe los nombres de los integrantes separados por coma"
              value={members}
              onChange={(event) => setMembers(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/20"

            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:opacity-90"
          >
            Enviar solicitud
          </button>
        </form>
      </div>
    </main>
  );
}