export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.eventSettings.findFirst();

        return NextResponse.json({
            ok: true,
            settings,
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