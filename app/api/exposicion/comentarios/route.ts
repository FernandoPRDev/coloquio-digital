export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanText(value: string) {
    return value.trim().replace(/[<>]/g, "");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const teamId = String(body.teamId || "");
        const name = cleanText(String(body.name || ""));
        const comment = cleanText(String(body.comment || ""));

        if (!teamId || !name || !comment) {
            return NextResponse.json(
                { ok: false, message: "Nombre y comentario son obligatorios." },
                { status: 400 }
            );
        }

        const publicComment = await prisma.publicComment.create({
            data: { teamId, name, comment },
        });

        return NextResponse.json({
            ok: true,
            message: "Comentario publicado correctamente.",
            comment: publicComment,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al publicar comentario.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}