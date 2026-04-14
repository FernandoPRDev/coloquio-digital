import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { teamId, comments } = body;

    const evaluation = await prisma.evaluation.update({
      where: {
        teamId,
      },
      data: {
        comments,
        status: "REVIEWED",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Evaluación guardada",
      evaluation,
    });
  } catch (error: any) {
    console.error("Error al guardar evaluación:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al guardar evaluación",
        error: error.message,
      },
      { status: 500 }
    );
  }
}