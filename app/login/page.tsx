"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";
import { PrimaryButton, FormField, inputClassName } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

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
        if (result.user.role === "TEAM") {
          router.push("/dashboard/equipo");
        } else if (result.user.role === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (result.user.role === "TEACHER") {
          router.push("/dashboard/docente");
        }
      } else {
        setErrorMessage(result.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMessage("Ocurrió un error al iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="px-4 py-10 lg:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative overflow-hidden bg-[#2e5090] p-8 text-white lg:p-10">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#009e51]/40" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#f88f03]/40" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
              <div>
                <Image
                  src="/logo-movimiento-en-marcha.png"
                  alt="Movimiento en Marcha"
                  width={180}
                  height={180}
                  className="h-28 w-auto rounded-2xl bg-white/95 p-3"
                  priority
                />

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                  Acceso a plataforma
                </p>

                <h1 className="mt-4 text-4xl font-black leading-tight">
                  Gestiona tu participación en el coloquio
                </h1>

                <p className="mt-5 text-sm leading-6 text-white/80">
                  Ingresa para subir entregas, revisar evaluaciones o administrar
                  salas, equipos y exposición pública.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-white/80">
                <p>Ambiental · Desarrollo · Derechos humanos</p>
                <p className="text-white/60">Movimiento en Marcha</p>
              </div>
            </div>
          </aside>

          <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2e5090]">
                Bienvenido
              </p>

              <h2 className="mt-3 text-3xl font-black text-zinc-900">
                Iniciar sesión
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Accede con el correo y contraseña registrados.
              </p>

              <div className="mt-6">
                {errorMessage && (
                  <SimpleToast message={errorMessage} type="error" />
                )}
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

                <FormField label="Contraseña">
                  <input
                    type="password"
                    placeholder="Escribe tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className={inputClassName}
                  />
                </FormField>

                <div className="flex justify-end">
                  <Link
                    href="/recuperar-password"
                    className="text-sm font-semibold text-[#2e5090] underline underline-offset-4 hover:opacity-80"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>

                <PrimaryButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </PrimaryButton>
              </form>

              <p className="mt-8 text-center text-sm text-zinc-600">
                ¿Aún no tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-semibold text-[#2e5090] underline underline-offset-4"
                >
                  Registra tu equipo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}