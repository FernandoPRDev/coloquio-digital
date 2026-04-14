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
          include: {
            user: true,
          },
        },
        teachers: {
          where: {
            role: "TEACHER",
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      rooms,
    });
  } catch (error: any) {
    console.error("Error al obtener salas:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener salas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}