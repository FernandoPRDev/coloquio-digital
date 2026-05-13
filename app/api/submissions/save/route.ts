export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            title,
            description,
            teamId,
            pdfUrl,
            pdfFilename,
            presentationPdfUrl,
            presentationPdfFilename,
            videoUrl,
            videoFilename,
        } = body;

        if (!title || !teamId) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "Faltan campos obligatorios.",
                },
                { status: 400 }
            );
        }

        const settings = await prisma.eventSettings.findFirst();

        if (
            settings?.submissionDeadline &&
            new Date() > settings.submissionDeadline
        ) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "La fecha límite de entrega ya terminó.",
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

        if (
            !existingSubmission &&
            (!pdfUrl || !presentationPdfUrl || !videoUrl)
        ) {
            return NextResponse.json(
                {
                    ok: false,
                    message:
                        "Debes subir el PDF principal, PDF de presentación y video.",
                },
                { status: 400 }
            );
        }

        const submissionData = {
            title,
            description: description || null,

            pdfUrl: pdfUrl || existingSubmission?.pdfUrl || null,
            pdfFilename: pdfFilename || existingSubmission?.pdfFilename || null,

            presentationPdfUrl:
                presentationPdfUrl || existingSubmission?.presentationPdfUrl || null,
            presentationPdfFilename:
                presentationPdfFilename ||
                existingSubmission?.presentationPdfFilename ||
                null,

            videoUrl: videoUrl || existingSubmission?.videoUrl || null,
            videoFilename:
                videoFilename || existingSubmission?.videoFilename || null,
        };

        const submission = existingSubmission
            ? await prisma.submission.update({
                where: {
                    id: existingSubmission.id,
                },
                data: submissionData,
            })
            : await prisma.submission.create({
                data: {
                    ...submissionData,
                    teamId,
                },
            });

        return NextResponse.json({
            ok: true,
            message: "Entrega guardada correctamente.",
            submission,
        });
    } catch (error: any) {
        console.error("Error al guardar entrega:", error);

        return NextResponse.json(
            {
                ok: false,
                message: "Error al guardar entrega.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}