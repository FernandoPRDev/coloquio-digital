"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { SectionCard, StatusBadge } from "@/components/ui";

type PublicSettings = {
  homeVideoUrl?: string | null;
  homeVideoEnabled?: boolean;
};

export default function Home() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings-public");
        const result = await response.json();

        if (result.ok) {
          setSettings(result.settings);
        }
      } catch (error) {
        console.error("Error al cargar configuración pública:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <PublicLayout>
      <section className="px-4 py-10 lg:px-6 lg:py-14">
        <div className="mx-auto max-w-6xl space-y-10">
          {settings?.homeVideoEnabled && settings?.homeVideoUrl && (
            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                Presentación
              </p>

              <h2 className="mt-2 text-3xl font-black text-zinc-900">
                Video de presentación del coloquio
              </h2>

              <video
                controls
                src={settings.homeVideoUrl}
                className="mt-6 w-full rounded-3xl bg-black"
              />
            </section>
          )}
          <section className="overflow-hidden rounded-[36px] bg-[#2e5090] p-8 text-white shadow-xl lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                  Movimiento en marcha
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Coloquio creativo de proyectos para ONG
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
                  Plataforma digital para registrar equipos, subir propuestas,
                  organizar salas, evaluar entregas y exhibir proyectos sociales.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/registro"
                    className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#2e5090] shadow-sm transition hover:bg-white/90"
                  >
                    Registrar equipo
                  </Link>

                  <Link
                    href="/exposicion"
                    className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Ver exposición
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <StatusBadge tone="success">Ambiental</StatusBadge>
                  <p className="mt-4 text-2xl font-black">
                    Propuestas sostenibles
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <StatusBadge tone="warning">Desarrollo</StatusBadge>
                  <p className="mt-4 text-2xl font-black">
                    Impacto comunitario
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <StatusBadge tone="blue">Derechos humanos</StatusBadge>
                  <p className="mt-4 text-2xl font-black">
                    Comunicación con propósito
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <SectionCard>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#009e51]">
                01 Registro
              </p>
              <h2 className="mt-3 text-xl font-black text-zinc-900">
                Equipos participantes
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Los equipos solicitan acceso, registran su proyecto y son
                aprobados por administración.
              </p>
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f88f03]">
                02 Entrega
              </p>
              <h2 className="mt-3 text-xl font-black text-zinc-900">
                PDF y video
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Cada equipo puede subir su documento y video dentro del periodo
                definido por el evento.
              </p>
            </SectionCard>

            <SectionCard>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                03 Exposición
              </p>
              <h2 className="mt-3 text-xl font-black text-zinc-900">
                Galería pública
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Los proyectos se exhiben por sala y categoría para consulta del
                público invitado.
              </p>
            </SectionCard>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionCard className="bg-gradient-to-br from-[#2e5090] to-[#009e51] text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                Plataforma integral
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Un solo entorno para coordinar el coloquio
              </h2>
            </SectionCard>

            <SectionCard>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-3xl font-black text-[#009e51]">3</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Categorías de ONG
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-[#f88f03]">11</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Salas de exposición
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-[#2e5090]">100%</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Flujo digital
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </section>
    </PublicLayout>
  );
}