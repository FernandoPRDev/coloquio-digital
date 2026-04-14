export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { userId } = await params;

    const team = await prisma.team.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
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
    console.error("Error al obtener equipo:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener datos del equipo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}