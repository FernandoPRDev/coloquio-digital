export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function sanitizeFilename(name: string) {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.\-_]/g, "");
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const title = String(formData.get("title") || "");
        const description = String(formData.get("description") || "");
        const teamId = String(formData.get("teamId") || "");

        const pdfEntry = formData.get("pdfFile");
        const videoEntry = formData.get("videoFile");

        const pdfFile = pdfEntry instanceof File && pdfEntry.size > 0 ? pdfEntry : null;
        const videoFile =
            videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;

        if (!title || !teamId) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "Faltan campos obligatorios.",
                },
                { status: 400 }
            );
        }

        const team = await prisma.team.findUnique({
            where: {
                id: teamId,
            },
            include: {
                evaluation: true,
                submissions: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!team) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "Equipo no encontrado.",
                },
                { status: 404 }
            );
        }

        if (team.evaluation?.status === "REVIEWED") {
            return NextResponse.json(
                {
                    ok: false,
                    message: "La entrega ya fue evaluada y no puede modificarse.",
                },
                { status: 400 }
            );
        }

        const existingSubmission = team.submissions[0] || null;

        // Si es primera entrega, ambos son obligatorios
        if (!existingSubmission && (!pdfFile || !videoFile)) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "Debes subir un PDF y un video.",
                },
                { status: 400 }
            );
        }

        // Validar PDF solo si viene uno nuevo
        if (pdfFile) {
            if (!ALLOWED_PDF_TYPES.includes(pdfFile.type)) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "El archivo PDF no es válido.",
                    },
                    { status: 400 }
                );
            }

            if (pdfFile.size > MAX_PDF_SIZE) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "El PDF supera el tamaño máximo permitido de 10 MB.",
                    },
                    { status: 400 }
                );
            }
        }

        // Validar video solo si viene uno nuevo
        if (videoFile) {
            if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "El archivo de video no es válido.",
                    },
                    { status: 400 }
                );
            }

            if (videoFile.size > MAX_VIDEO_SIZE) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "El video supera el tamaño máximo permitido de 100 MB.",
                    },
                    { status: 400 }
                );
            }
        }

        let pdfUrl = existingSubmission?.pdfUrl || null;
        let videoUrl = existingSubmission?.videoUrl || null;
        let pdfFilename = existingSubmission?.pdfFilename || null;
        let videoFilename = existingSubmission?.videoFilename || null;

        const timestamp = Date.now();

        if (pdfFile) {
            const safePdfName = sanitizeFilename(pdfFile.name);

            const pdfBlob = await put(
                `submissions/${teamId}/pdf-${timestamp}-${safePdfName}`,
                pdfFile,
                {
                    access: "public",
                    addRandomSuffix: false,
                }
            );

            pdfUrl = pdfBlob.url;
            pdfFilename = pdfFile.name;
        }

        if (videoFile) {
            const safeVideoName = sanitizeFilename(videoFile.name);

            const videoBlob = await put(
                `submissions/${teamId}/video-${timestamp}-${safeVideoName}`,
                videoFile,
                {
                    access: "public",
                    addRandomSuffix: false,
                }
            );

            videoUrl = videoBlob.url;
            videoFilename = videoFile.name;
        }

        let submission;

        if (existingSubmission) {
            submission = await prisma.submission.update({
                where: {
                    id: existingSubmission.id,
                },
                data: {
                    title,
                    description: description || null,
                    pdfUrl,
                    videoUrl,
                    pdfFilename,
                    videoFilename,
                },
            });
        } else {
            submission = await prisma.submission.create({
                data: {
                    title,
                    description: description || null,
                    pdfUrl,
                    videoUrl,
                    pdfFilename,
                    videoFilename,
                    teamId,
                },
            });
        }

        return NextResponse.json({
            ok: true,
            message: "Entrega guardada correctamente.",
            submission,
        });
    } catch (error: any) {
        console.error("Error al subir entrega:", error);

        return NextResponse.json(
            {
                ok: false,
                message: "Ocurrió un error al subir la entrega.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}