import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, description, publicLink, teamId } = body;

    const submission = await prisma.submission.create({
      data: {
        title,
        description,
        publicLink,
        teamId,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Entrega guardada correctamente",
      submission,
    });
  } catch (error: any) {
    console.error("Error al guardar entrega:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al guardar la entrega",
        error: error.message,
      },
      { status: 500 }
    );
  }
}