import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EvaluationStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, description, publicLink, teamId } = body;

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        evaluation: true,
        submissions: {
          orderBy: {
            createdAt: "desc",
          },
        },
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

    if (team.evaluation?.status === EvaluationStatus.REVIEWED) {
      return NextResponse.json(
        {
          ok: false,
          message: "La entrega ya fue evaluada y no puede modificarse.",
        },
        { status: 400 }
      );
    }

    let submission;

    if (team.submissions.length > 0) {
      submission = await prisma.submission.update({
        where: {
          id: team.submissions[0].id,
        },
        data: {
          title,
          description,
          publicLink,
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          title,
          description,
          publicLink,
          teamId,
        },
      });
    }

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