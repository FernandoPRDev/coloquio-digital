import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
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

    await prisma.$transaction(async (tx) => {
      if (user.team) {
        await tx.submission.deleteMany({
          where: {
            teamId: user.team.id,
          },
        });

        if (user.team.evaluation) {
          await tx.evaluation.delete({
            where: {
              teamId: user.team.id,
            },
          });
        }

        await tx.team.delete({
          where: {
            id: user.team.id,
          },
        });
      }

      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
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