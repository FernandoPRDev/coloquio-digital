export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "No existe una cuenta con ese correo.",
        },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error: any) {
    console.error("Error al recuperar contraseña:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al actualizar contraseña",
        error: error.message,
      },
      { status: 500 }
    );
  }
}