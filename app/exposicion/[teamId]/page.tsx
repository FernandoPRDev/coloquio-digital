"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import SimpleToast from "@/components/SimpleToast";
import { getOngCategoryStyle } from "@/lib/ongCategories";

export default function ExpositionDetailPage() {
    const params = useParams();
    const teamId = String(params.teamId);

    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentName, setCommentName] = useState("");
    const [commentText, setCommentText] = useState("");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/exposicion/${teamId}`);
            const result = await response.json();

            if (result.ok) {
                setTeam(result.team);
            } else {
                setErrorMessage(result.message || "No se pudo cargar el proyecto.");
            }
        } catch (error) {
            console.error("Error al cargar proyecto:", error);
            setErrorMessage("Ocurrió un error al cargar el proyecto.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [teamId]);

    const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setMessage("");
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/exposicion/comentarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamId,
                    name: commentName,
                    comment: commentText,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                setMessage("Comentario publicado correctamente.");
                setCommentName("");
                setCommentText("");
                await fetchProject();
            } else {
                setErrorMessage(result.message || "No se pudo publicar el comentario.");
            }
        } catch (error) {
            console.error("Error al publicar comentario:", error);
            setErrorMessage("Ocurrió un error al publicar el comentario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="mx-auto max-w-5xl px-4 py-20 text-center text-zinc-600">
                    Cargando proyecto...
                </div>
            </PublicLayout>
        );
    }

    if (!team) {
        return (
            <PublicLayout>
                <div className="mx-auto max-w-5xl px-4 py-20 text-center">
                    <p className="font-bold text-zinc-900">Proyecto no encontrado.</p>

                    <Link
                        href="/exposicion"
                        className="mt-4 inline-flex rounded-xl bg-[#2e5090] px-5 py-3 text-sm font-bold text-white"
                    >
                        Volver a exposición
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    const submission = team.submissions?.[0];
    const categoryStyle = getOngCategoryStyle(team.category);

    return (
        <PublicLayout>
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 lg:px-6">
                <Link
                    href="/exposicion"
                    className="inline-flex rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                    ← Volver a exposición
                </Link>

                <section className="overflow-hidden rounded-[36px] bg-white shadow-xl">
                    <div
                        className="h-3 w-full"
                        style={{ backgroundColor: categoryStyle.color }}
                    />

                    <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700">
                                    {team.room?.name || "Sin sala"}
                                </span>

                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
                                >
                                    {categoryStyle.label}
                                </span>
                            </div>

                            <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-900 md:text-5xl">
                                {team.projectName}
                            </h1>

                            <p className="mt-3 text-lg font-semibold text-zinc-700">
                                Equipo: {team.teamName}
                            </p>

                            {submission?.description && (
                                <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
                                    {submission.description}
                                </p>
                            )}
                        </div>

                        <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Entrega
                            </p>

                            <h2 className="mt-3 text-2xl font-black text-zinc-900">
                                {submission?.title || "Sin entrega"}
                            </h2>

                            <div className="mt-5 space-y-3 text-sm text-zinc-600">
                                {submission?.pdfFilename && (
                                    <p className="break-words">PDF: {submission.pdfFilename}</p>
                                )}
                                {submission?.videoFilename && (
                                    <p className="break-words">
                                        Video: {submission.videoFilename}
                                    </p>
                                )}
                                {submission?.presentationPdfFilename && (
                                    <p className="break-words">
                                        Presentación: {submission.presentationPdfFilename}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-5 md:grid-cols-2">
                    {submission?.pdfUrl && (
                        <a
                            href={submission.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#2e5090] hover:shadow-md"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                                    📄
                                </div>

                                <div className="min-w-0">
                                    <p className="font-black text-zinc-900">Documento PDF</p>
                                    <p className="truncate text-sm text-zinc-500">
                                        {submission.pdfFilename || "Ver PDF"}
                                    </p>
                                </div>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition group-hover:bg-[#2e5090] group-hover:text-white">
                                ↗
                            </span>
                        </a>
                    )}

                    {submission?.presentationPdfUrl && (
                        <a
                            href={submission.presentationPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#2e5090] hover:shadow-md"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                                    📄
                                </div>

                                <div className="min-w-0">
                                    <p className="font-black text-zinc-900">Presentación PDF</p>
                                    <p className="truncate text-sm text-zinc-500">
                                        {submission.presentationPdfFilename || "Ver PDF"}
                                    </p>
                                </div>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition group-hover:bg-[#2e5090] group-hover:text-white">
                                ↗
                            </span>
                        </a>
                    )}

                    {submission?.videoUrl && (
                        <a
                            href={submission.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#2e5090] hover:shadow-md"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2e5090]/10 text-2xl text-[#2e5090]">
                                    ▶
                                </div>

                                <div className="min-w-0">
                                    <p className="font-black text-zinc-900">
                                        Video de presentación
                                    </p>
                                    <p className="truncate text-sm text-zinc-500">
                                        {submission.videoFilename || "Ver video"}
                                    </p>
                                </div>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition group-hover:bg-[#2e5090] group-hover:text-white">
                                ↗
                            </span>
                        </a>
                    )}
                </section>

                {submission?.videoUrl && (
                    <section className="rounded-[32px] bg-white p-6 shadow-sm lg:p-8">
                        <h2 className="text-2xl font-black text-zinc-900">
                            Video de presentación
                        </h2>

                        <video
                            controls
                            className="mt-5 w-full rounded-2xl bg-black"
                            src={submission.videoUrl}
                        />
                    </section>
                )}

                {submission?.pdfUrl && (
                    <section className="rounded-[32px] bg-white p-6 shadow-sm lg:p-8">
                        <h2 className="text-2xl font-black text-zinc-900">
                            Documento PDF
                        </h2>

                        <iframe
                            src={submission.pdfUrl}
                            className="mt-5 h-[800px] w-full rounded-2xl border border-zinc-200"
                        />
                    </section>
                )}

                <section className="rounded-[32px] bg-white p-6 shadow-sm lg:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e5090]">
                                Participación pública
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-zinc-900">
                                Comentarios
                            </h2>

                            <p className="mt-2 text-sm text-zinc-600">
                                Deja un comentario público para este equipo.
                            </p>
                        </div>

                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700">
                            {team.publicComments?.length || 0} comentario(s)
                        </span>
                    </div>

                    <div className="mt-6 space-y-3">
                        {message && <SimpleToast message={message} type="success" />}
                        {errorMessage && (
                            <SimpleToast message={errorMessage} type="error" />
                        )}
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleCommentSubmit}>
                        <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={commentName}
                                onChange={(event) => setCommentName(event.target.value)}
                                maxLength={80}
                                required
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#2e5090] focus:ring-2 focus:ring-[#2e5090]/20"
                            />

                            <textarea
                                rows={3}
                                placeholder="Escribe un comentario"
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                maxLength={500}
                                required
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#2e5090] focus:ring-2 focus:ring-[#2e5090]/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#2e5090] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:bg-zinc-400"
                        >
                            {isSubmitting ? "Publicando..." : "Publicar comentario"}
                        </button>
                    </form>

                    {team.publicComments?.length === 0 ? (
                        <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                            <p className="font-bold text-zinc-900">
                                Aún no hay comentarios para este proyecto.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-4">
                            {team.publicComments?.map((comment: any) => (
                                <article
                                    key={comment.id}
                                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                                >
                                    <p className="font-black text-zinc-900">{comment.name}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                                        {comment.comment}
                                    </p>
                                    <p className="mt-3 text-xs text-zinc-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}