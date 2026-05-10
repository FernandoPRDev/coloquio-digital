export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const settings = await prisma.eventSettings.findFirst();

    if (!settings?.expositionEnabled) {
        return NextResponse.json({
            ok: true,
            expositionOpen: false,
            message: "La exposición no está activa.",
            rooms: [],
            settings,
        });
    }

    if (settings?.expositionOpenAt && new Date() < settings.expositionOpenAt) {
        return NextResponse.json({
            ok: true,
            expositionOpen: false,
            message: "La exposición todavía no está disponible.",
            rooms: [],
            settings,
        });
    }
    try {
        const rooms = await prisma.room.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                teams: {
                    where: {
                        submissions: {
                            some: {},
                        },
                    },
                    include: {
                        submissions: {
                            orderBy: {
                                createdAt: "desc",
                            },
                            take: 1,
                        },
                        publicComments: {
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                    orderBy: {
                        teamName: "asc",
                    },
                },
            },
        });

        return NextResponse.json({
            ok: true,
            expositionOpen: true,
            rooms,
            settings,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al cargar exposición",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}