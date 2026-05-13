"use client";
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
            homeVideoUrl: null,
            submissionDeadline: null,
            expositionOpenAt: null,
        },
    });
}

export async function GET() {
    try {
        const settings = await getOrCreateSettings();

        return NextResponse.json({
            ok: true,
            settings: {
                submissionDeadline: settings.submissionDeadline,
                expositionOpenAt: settings.expositionOpenAt,
                expositionEnabled: settings.expositionEnabled,
                homeVideoUrl: settings.homeVideoUrl,
                homeVideoEnabled: settings.homeVideoEnabled,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al obtener configuración pública.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}