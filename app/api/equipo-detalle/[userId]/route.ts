export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const team = await prisma.team.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
        room: true,
        submissions: {
          orderBy: {
            createdAt: "desc",
          },
        },
        evaluation: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        {
          ok: false,
          message: "Equipo no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      team,
    });
  } catch (error: any) {
    console.error("Error al obtener detalle del equipo:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener detalle del equipo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}