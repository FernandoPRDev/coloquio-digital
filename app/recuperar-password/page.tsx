"use client";

import { FormEvent, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
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
    }
  };

  return (
    <PublicLayout>
      <section className="px-4 py-10 lg:px-6 lg:py-14">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            Recuperar contraseña
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Ingresa tu correo y define una nueva contraseña.
          </p>

          <div className="mt-6 space-y-3">
            {message && <SimpleToast message={message} type="success" />}
            {errorMessage && <SimpleToast message={errorMessage} type="error" />}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-white transition hover:opacity-90"
            >
              Actualizar contraseña
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}