export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateSettings() {
    const existing = await prisma.eventSettings.findFirst();

    if (existing) return existing;

    return prisma.eventSettings.create({
        data: {
            expositionEnabled: true,
            homeVideoEnabled: false,
        },
    });
}

function parseMexicoDateTime(value?: string | null) {
    if (!value) return null;

    return new Date(`${value}:00-06:00`);
}

export async function GET() {
    try {
        const settings = await getOrCreateSettings();

        return NextResponse.json({
            ok: true,
            settings,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al obtener configuración",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const {
            submissionDeadline,
            expositionOpenAt,
            expositionEnabled,
            homeVideoUrl,
            homeVideoEnabled,
        } = body;

        const settings = await getOrCreateSettings();

        const updated = await prisma.eventSettings.update({
            where: {
                id: settings.id,
            },
            data: {
                submissionDeadline: parseMexicoDateTime(submissionDeadline),
                expositionOpenAt: parseMexicoDateTime(expositionOpenAt),
                expositionEnabled: Boolean(expositionEnabled),

                homeVideoUrl: homeVideoUrl || null,
                homeVideoEnabled: Boolean(homeVideoEnabled),
            },
        });

        return NextResponse.json({
            ok: true,
            message: "Configuración guardada correctamente",
            settings: updated,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al guardar configuración",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}