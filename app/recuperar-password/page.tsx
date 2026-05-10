"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";
import { FormField, inputClassName, PrimaryButton } from "@/components/ui";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    if (newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/recuperar-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setMessage("Tu contraseña fue actualizada correctamente.");
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(result.message || "No se pudo actualizar la contraseña.");
      }
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      setErrorMessage("Ocurrió un error al actualizar la contraseña.");
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
                  Recuperación de acceso
                </p>

                <h1 className="mt-4 text-4xl font-black leading-tight">
                  Restablece tu contraseña
                </h1>

                <p className="mt-5 text-sm leading-6 text-white/80">
                  Define una nueva contraseña para volver a ingresar a la
                  plataforma del coloquio.
                </p>
              </div>

              <p className="text-sm text-white/60">
                Movimiento en Marcha · Coloquio Creativo
              </p>
            </div>
          </aside>

          <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2e5090]">
                Acceso
              </p>

              <h2 className="mt-3 text-3xl font-black text-zinc-900">
                Recuperar contraseña
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Ingresa tu correo y define una nueva contraseña.
              </p>

              <div className="mt-6 space-y-3">
                {message && <SimpleToast message={message} type="success" />}
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
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Nueva contraseña"
                  helpText="Debe tener al menos 8 caracteres."
                >
                  <input
                    type="password"
                    placeholder="Escribe tu nueva contraseña"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Confirmar nueva contraseña">
                  <input
                    type="password"
                    placeholder="Vuelve a escribir la contraseña"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    className={inputClassName}
                  />
                </FormField>

                <PrimaryButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting
                    ? "Actualizando..."
                    : "Actualizar contraseña"}
                </PrimaryButton>
              </form>

              <p className="mt-8 text-center text-sm text-zinc-600">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#2e5090] underline underline-offset-4"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}