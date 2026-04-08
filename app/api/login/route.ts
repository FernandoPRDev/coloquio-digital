import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: {
        email,
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

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          ok: false,
          message: "Contraseña incorrecta",
        },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          ok: false,
          message: "Tu cuenta aún no ha sido aprobada por el administrador",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Login correcto",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error("Error en login:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al iniciar sesión",
        error: error.message,
      },
      { status: 500 }
    );
  }
}