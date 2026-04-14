export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params;

    const submissions = await prisma.submission.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      submissions,
    });
  } catch (error: any) {
    console.error("Error al obtener entregas:", error);

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