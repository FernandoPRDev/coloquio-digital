export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, message: "Tu cuenta aún no ha sido aprobada." },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { ok: false, message: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      ok: true,
      message: "Inicio de sesión correcto.",
      user: safeUser,
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error: any) {
    console.error("Error en login:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al iniciar sesión.",
        error: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}