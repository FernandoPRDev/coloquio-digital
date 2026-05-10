export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: "TEAM",
                status: "ACTIVE",
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                team: {
                    include: {
                        room: true,
                        submissions: true,
                        evaluation: true,
                        publicComments: true,
                    },
                },
            },
        });

        return NextResponse.json({
            ok: true,
            users,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                message: "Error al obtener usuarios activos.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}