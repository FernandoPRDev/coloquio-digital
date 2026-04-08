import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: Status.REJECTED,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario rechazado correctamente",
      user: updatedUser,
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