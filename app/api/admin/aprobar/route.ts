export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Falta el userId",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario aprobado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al aprobar usuario:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al aprobar usuario",
        error: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}