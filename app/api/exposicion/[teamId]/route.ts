export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: Request,
    context: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await context.params;

        const team = await prisma.team.findUnique({
            where: {
                id: teamId,
            },
            include: {
                room: true,
                submissions: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                publicComments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        return NextResponse.json({
            ok: true,
            team,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al cargar proyecto",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}