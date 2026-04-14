export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const teacher = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        room: true,
      },
    });

    if (!teacher || teacher.role !== "TEACHER" || !teacher.roomId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Docente no válido o sin sala asignada",
        },
        { status: 404 }
      );
    }

    const teams = await prisma.team.findMany({
      where: {
        roomId: teacher.roomId,
      },
      include: {
        user: true,
        submissions: true,
        evaluation: true,
        room: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      room: teacher.room,
      teams,
    });
  } catch (error: any) {
    console.error("Error al cargar evaluaciones docente:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener equipos",
        error: error.message,
      },
      { status: 500 }
    );
  }
}