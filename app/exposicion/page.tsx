"use client";

import { getOngCategoryStyle } from "@/lib/ongCategories";
import { FormEvent, useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import Link from "next/link";



type PublicComment = {
    id: string;
    name: string;
    comment: string;
    createdAt: string;
};

type Submission = {
    id: string;
    title: string;
    description?: string | null;
    pdfUrl?: string | null;
    videoUrl?: string | null;
    pdfFilename?: string | null;
    videoFilename?: string | null;
    createdAt: string;
};

type Team = {
    id: string;
    teamName: string;
    projectName: string;
    category: string;
    submissions: Submission[];
    publicComments: PublicComment[];
};

type Room = {
    id: string;
    name: string;
    teams: Team[];
};

export default function ExposicionPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentName, setCommentName] = useState<Record<string, string>>({});
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [search, setSearch] = useState("");

    const now = new Date();

    const [expositionOpen, setExpositionOpen] = useState(false);
    const [expositionMessage, setExpositionMessage] = useState("");
    const [settings, setSettings] = useState<{
        expositionOpenAt?: string | null;
        expositionEnabled?: boolean;
    } | null>(null);

    const fetchExposition = async () => {
        try {
            const response = await fetch("/api/exposicion");
            const result = await response.json();

            if (result.ok) {
                setRooms(result.rooms || []);
                setExpositionOpen(Boolean(result.expositionOpen));
                setExpositionMessage(result.message || "");
                setSettings(result.settings || null);
            }
        } catch (error) {
            console.error("Error al cargar exposición:", error);
            setErrorMessage("No se pudo cargar la exposición.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExposition();
    }, []);

    const handleCommentSubmit = async (
        event: FormEvent<HTMLFormElement>,
        teamId: string
    ) => {
        event.preventDefault();

        setMessage("");
        setErrorMessage("");

        try {
            const response = await fetch("/api/exposicion/comentarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamId,
                    name: commentName[teamId] || "",
                    comment: commentText[teamId] || "",
                }),
            });

            const result = await response.json();

            if (result.ok) {
                setMessage("Comentario publicado correctamente.");
                setCommentName((prev) => ({ ...prev, [teamId]: "" }));
                setCommentText((prev) => ({ ...prev, [teamId]: "" }));
                fetchExposition();
            } else {
                setErrorMessage(result.message || "No se pudo publicar el comentario.");
            }
        } catch (error) {
            console.error("Error al publicar comentario:", error);
            setErrorMessage("Ocurrió un error al publicar el comentario.");
        }
    };

    return (
        <PublicLayout>




            <section className="px-4 py-10 lg:px-6 lg:py-14">
                <div className="mx-auto max-w-6xl">
                    <section className="mb-12 overflow-hidden rounded-[32px] bg-[#2e5090] px-8 py-12 text-white shadow-xl">
                        <div className="max-w-4xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                Movimiento en marcha
                            </p>

                            <h1 className="text-4xl font-black leading-tight md:text-5xl">
                                Exposición digital de proyectos sociales
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                                Explora propuestas desarrolladas por equipos universitarios enfocadas en
                                impacto social, sostenibilidad y desarrollo comunitario.
                            </p>
                        </div>
                    </section>

                    <section className="mb-10 flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                        <input
                            type="text"
                            placeholder="Buscar proyecto o equipo"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-[#2e5090]"
                        />

                        <select
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-[#2e5090]"
                        >
                            <option value="all">Todas las categorías</option>
                            <option value="ambiental">Ambiental</option>
                            <option value="desarrollo">Desarrollo</option>
                            <option value="derechos-humanos">Derechos humanos</option>
                        </select>
                    </section>

                    {!expositionOpen ? (
                        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                            <p className="mt-3 text-zinc-600">
                                {expositionMessage || "La exposición todavía no está disponible."}
                            </p>

                            {settings?.expositionOpenAt && (
                                <p className="mt-4 rounded-2xl bg-zinc-100 px-4 py-3 font-semibold text-zinc-900">
                                    Disponible a partir de:{" "}
                                    {new Date(settings.expositionOpenAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : loading ? (
                        <p className="mt-8 text-zinc-600">Cargando exposición...</p>
                    ) : (
                        <div className="mt-8 space-y-8">
                            {message && (
                                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                                    {message}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}

                            {rooms.length === 0 ? (
                                <div className="rounded-3xl bg-white p-8 shadow-sm">
                                    <p className="text-zinc-600">
                                        Aún no hay proyectos disponibles para mostrar.
                                    </p>
                                </div>
                            ) : (
                                rooms.map((room) => {
                                    const filteredTeams = room.teams.filter((team) => {
                                        const matchesCategory =
                                            selectedCategory === "all" || team.category === selectedCategory;

                                        const searchText = search.toLowerCase();

                                        const matchesSearch =
                                            team.teamName.toLowerCase().includes(searchText) ||
                                            team.projectName.toLowerCase().includes(searchText);

                                        return matchesCategory && matchesSearch;
                                    });

                                    return (
                                        <section
                                            key={room.id}
                                            className="rounded-3xl bg-white p-6 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-zinc-900">
                                                        {room.name}
                                                    </h2>
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {filteredTeams.length} proyecto(s) disponible(s)
                                                    </p>
                                                </div>
                                            </div>

                                            {filteredTeams.length === 0 ? (
                                                <p className="mt-6 text-zinc-600">
                                                    Esta sala no tiene proyectos que coincidan con los filtros.
                                                </p>
                                            ) : (
                                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                                    {filteredTeams.map((team) => {

                                                        const submission = team.submissions[0];
                                                        const categoryStyle = getOngCategoryStyle(team.category);

                                                        return (
                                                            <article
                                                                key={team.id}
                                                                className="group overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                                            >
                                                                <div
                                                                    className="h-2 w-full"
                                                                    style={{ backgroundColor: categoryStyle.color }}
                                                                />

                                                                <div className="space-y-5 p-6">
                                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                                        <div>
                                                                            <p className="text-sm font-medium text-zinc-500">Equipo</p>
                                                                            <h3 className="mt-1 text-2xl font-black text-zinc-900">
                                                                                {team.teamName}
                                                                            </h3>
                                                                        </div>

                                                                        <span
                                                                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                                                                        >
                                                                            {categoryStyle.label}
                                                                        </span>
                                                                    </div>

                                                                    <div className="grid gap-4 md:grid-cols-2">
                                                                        <div>
                                                                            <p className="text-sm text-zinc-500">Proyecto</p>
                                                                            <p className="mt-1 font-black text-zinc-900">
                                                                                {team.projectName}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-zinc-500">Sala</p>
                                                                            <p className="mt-1 font-black text-zinc-900">
                                                                                {room.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {submission && (
                                                                        <div className="rounded-3xl bg-zinc-50 p-5">
                                                                            <p className="text-sm text-zinc-500">Título de entrega</p>
                                                                            <p className="mt-1 font-black text-zinc-900">
                                                                                {submission.title}
                                                                            </p>

                                                                            {submission.description && (
                                                                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                                                                                    {submission.description}
                                                                                </p>
                                                                            )}

                                                                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
                                                                                {submission.pdfUrl && (
                                                                                    <span className="rounded-full bg-white px-3 py-1">
                                                                                        PDF disponible
                                                                                    </span>
                                                                                )}

                                                                                {submission.videoUrl && (
                                                                                    <span className="rounded-full bg-white px-3 py-1">
                                                                                        Video disponible
                                                                                    </span>
                                                                                )}

                                                                                <span className="rounded-full bg-white px-3 py-1">
                                                                                    {team.publicComments.length} comentario(s)
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <Link
                                                                        href={`/exposicion/${team.id}`}
                                                                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#2e5090] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                                                                    >
                                                                        Ver proyecto
                                                                    </Link>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </section>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}