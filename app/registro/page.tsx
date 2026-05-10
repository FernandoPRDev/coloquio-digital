"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";
import { FormField, inputClassName, PrimaryButton, StatusBadge } from "@/components/ui";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          representativeName,
          email,
          password,
          projectName,
          category,
          members,
        }),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="px-4 py-10 lg:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative overflow-hidden bg-zinc-950 p-8 text-white lg:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#2e5090]/60" />
            <div className="absolute bottom-20 right-20 h-36 w-36 rounded-full bg-[#009e51]/50" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-[#f88f03]/50" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
              <div>
                <Image
                  src="/logo-movimiento-en-marcha.png"
                  alt="Movimiento en Marcha"
                  width={180}
                  height={180}
                  className="h-28 w-auto rounded-2xl bg-white p-3"
                  priority
                />

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                  Registro de participación
                </p>

                <h1 className="mt-4 text-4xl font-black leading-tight">
                  Inscribe tu equipo al coloquio creativo
                </h1>

                <p className="mt-5 text-sm leading-6 text-white/75">
                  Registra los datos principales del equipo, selecciona la
                  categoría de ONG y espera la aprobación del administrador.
                </p>
              </div>

              <div className="space-y-3">
                <StatusBadge tone="success">Ambiental</StatusBadge>
                <StatusBadge tone="warning">Desarrollo</StatusBadge>
                <StatusBadge tone="blue">Derechos humanos</StatusBadge>
              </div>
            </div>
          </aside>

          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2e5090]">
                Solicitud de acceso
              </p>

              <h2 className="mt-3 text-3xl font-black text-zinc-900">
                Registro de equipo
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Completa la información para solicitar acceso al sistema del
                coloquio.
              </p>
            </div>

            <div className="mb-6 space-y-3">
              {successMessage && (
                <SimpleToast message={successMessage} type="success" />
              )}
              {errorMessage && (
                <SimpleToast message={errorMessage} type="error" />
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Nombre del equipo">
                  <input
                    type="text"
                    placeholder="Ej. Creativos UV"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Nombre del representante">
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={representativeName}
                    onChange={(event) =>
                      setRepresentativeName(event.target.value)
                    }
                    autoComplete="name"
                    required
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <FormField label="Correo electrónico">
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className={inputClassName}
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Contraseña"
                  helpText="Debe tener al menos 8 caracteres."
                >
                  <input
                    type="password"
                    placeholder="Escribe una contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Confirmar contraseña">
                  <input
                    type="password"
                    placeholder="Vuelve a escribir tu contraseña"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <FormField label="Nombre del proyecto">
                <input
                  type="text"
                  placeholder="Ej. Estrategias de comunicación digital"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  required
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label="Categoría de ONG"
                helpText="Esta categoría define la línea temática y color visual del equipo dentro de la exposición."
              >
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className={inputClassName}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="ambiental">Ambiental</option>
                  <option value="desarrollo">Desarrollo</option>
                  <option value="derechos-humanos">Derechos humanos</option>
                </select>
              </FormField>

              <FormField label="Integrantes">
                <textarea
                  rows={4}
                  placeholder="Escribe los nombres de los integrantes separados por coma"
                  value={members}
                  onChange={(event) => setMembers(event.target.value)}
                  required
                  className={inputClassName}
                />
              </FormField>

              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud"}
              </PrimaryButton>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#2e5090] underline underline-offset-4"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}