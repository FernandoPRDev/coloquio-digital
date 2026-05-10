export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
            rooms,
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