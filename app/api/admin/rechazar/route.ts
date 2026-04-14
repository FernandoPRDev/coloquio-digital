export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        team: {
          include: {
            submissions: true,
            evaluation: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    if (user.team) {
      await prisma.submission.deleteMany({
        where: {
          teamId: user.team.id,
        },
      });

      if (user.team.evaluation) {
        await prisma.evaluation.delete({
          where: {
            teamId: user.team.id,
          },
        });
      }

      await prisma.team.delete({
        where: {
          id: user.team.id,
        },
      });
    }

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Registro rechazado y eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error al rechazar usuario:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al rechazar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}