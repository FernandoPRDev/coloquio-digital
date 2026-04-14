export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        team: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      submissions,
    });
  } catch (error: any) {
    console.error("Error al obtener entregas para docente:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener entregas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}