"use client";

import { FormEvent, useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";

const EXHIBITION_START_DATE = new Date(
    process.env.NEXT_PUBLIC_EXHIBITION_START_DATE ||
    "2026-05-15T09:00:00-06:00"
);

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

    const now = new Date();
    const isExhibitionOpen = now >= EXHIBITION_START_DATE;

    const fetchExposition = async () => {
        try {
            const response = await fetch("/api/exposicion");
            const result = await response.json();

            if (result.ok) {
                setRooms(result.rooms);
            }
        } catch (error) {
            console.error("Error al cargar exposición:", error);
            setErrorMessage("No se pudo cargar la exposición.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isExhibitionOpen) {
            fetchExposition();
        } else {
            setLoading(false);
        }
    }, [isExhibitionOpen]);

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
                    <div className="rounded-3xl bg-white p-8 shadow-sm">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                            Coloquio Digital
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
                            Exposición de proyectos
                        </h1>

                        <p className="mt-4 max-w-3xl text-zinc-600">
                            Consulta los proyectos registrados por sala, revisa sus entregas y
                            deja comentarios públicos para los equipos participantes.
                        </p>
                    </div>

                    {!isExhibitionOpen ? (
                        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900">
                                La exposición todavía no está disponible
                            </h2>

                            <p className="mt-3 text-zinc-600">
                                El contenido estará visible a partir de:
                            </p>

                            <p className="mt-4 rounded-2xl bg-zinc-100 px-4 py-3 font-semibold text-zinc-900">
                                {EXHIBITION_START_DATE.toLocaleString()}
                            </p>
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
                                rooms.map((room) => (
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
                                                    {room.teams.length} proyecto(s) disponible(s)
                                                </p>
                                            </div>
                                        </div>

                                        {room.teams.length === 0 ? (
                                            <p className="mt-6 text-zinc-600">
                                                Esta sala aún no tiene entregas publicadas.
                                            </p>
                                        ) : (
                                            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                                {room.teams.map((team) => {
                                                    const submission = team.submissions[0];

                                                    return (
                                                        <article
                                                            key={team.id}
                                                            className="rounded-2xl border border-zinc-200 p-5"
                                                        >
                                                            <div>
                                                                <p className="text-sm text-zinc-500">Equipo</p>
                                                                <h3 className="text-xl font-bold text-zinc-900">
                                                                    {team.teamName}
                                                                </h3>
                                                            </div>

                                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                                <div>
                                                                    <p className="text-sm text-zinc-500">
                                                                        Proyecto
                                                                    </p>
                                                                    <p className="font-semibold text-zinc-900">
                                                                        {team.projectName}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm text-zinc-500">
                                                                        Categoría
                                                                    </p>
                                                                    <p className="font-semibold text-zinc-900">
                                                                        {team.category}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {submission && (
                                                                <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                                                                    <p className="text-sm text-zinc-500">
                                                                        Título de entrega
                                                                    </p>
                                                                    <p className="font-semibold text-zinc-900">
                                                                        {submission.title}
                                                                    </p>

                                                                    {submission.description && (
                                                                        <p className="mt-3 text-sm text-zinc-600">
                                                                            {submission.description}
                                                                        </p>
                                                                    )}

                                                                    <div className="mt-4 flex flex-wrap gap-3">
                                                                        {submission.pdfUrl && (
                                                                            <a
                                                                                href={submission.pdfUrl}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                                                            >
                                                                                Ver PDF
                                                                            </a>
                                                                        )}

                                                                        {submission.videoUrl && (
                                                                            <a
                                                                                href={submission.videoUrl}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                                                                            >
                                                                                Ver video
                                                                            </a>
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-3 space-y-1 text-xs text-zinc-500">
                                                                        {submission.pdfFilename && (
                                                                            <p>PDF: {submission.pdfFilename}</p>
                                                                        )}
                                                                        {submission.videoFilename && (
                                                                            <p>Video: {submission.videoFilename}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-5">
                                                                <h4 className="font-semibold text-zinc-900">
                                                                    Comentarios públicos
                                                                </h4>

                                                                {team.publicComments.length === 0 ? (
                                                                    <p className="mt-2 text-sm text-zinc-500">
                                                                        Aún no hay comentarios para este equipo.
                                                                    </p>
                                                                ) : (
                                                                    <div className="mt-3 space-y-3">
                                                                        {team.publicComments.map((comment) => (
                                                                            <div
                                                                                key={comment.id}
                                                                                className="rounded-xl bg-zinc-50 p-3"
                                                                            >
                                                                                <p className="text-sm font-semibold text-zinc-900">
                                                                                    {comment.name}
                                                                                </p>
                                                                                <p className="mt-1 text-sm text-zinc-600">
                                                                                    {comment.comment}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <form
                                                                className="mt-5 space-y-3"
                                                                onSubmit={(event) =>
                                                                    handleCommentSubmit(event, team.id)
                                                                }
                                                            >
                                                                <input
                                                                    type="text"
                                                                    placeholder="Tu nombre"
                                                                    value={commentName[team.id] || ""}
                                                                    onChange={(event) =>
                                                                        setCommentName((prev) => ({
                                                                            ...prev,
                                                                            [team.id]: event.target.value,
                                                                        }))
                                                                    }
                                                                    maxLength={80}
                                                                    required
                                                                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                                                                />

                                                                <textarea
                                                                    rows={3}
                                                                    placeholder="Escribe un comentario"
                                                                    value={commentText[team.id] || ""}
                                                                    onChange={(event) =>
                                                                        setCommentText((prev) => ({
                                                                            ...prev,
                                                                            [team.id]: event.target.value,
                                                                        }))
                                                                    }
                                                                    maxLength={500}
                                                                    required
                                                                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                                                                />

                                                                <button
                                                                    type="submit"
                                                                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                                                >
                                                                    Publicar comentario
                                                                </button>
                                                            </form>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}