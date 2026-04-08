import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      teamName,
      representativeName,
      email,
      password,
      projectName,
      category,
      members,
    } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: representativeName,
        email,
        password: hashedPassword,
        role: Role.TEAM,
      },
    });

    const team = await prisma.team.create({
      data: {
        teamName,
        projectName,
        category,
        members,
        userId: user.id,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario y equipo creados correctamente",
      data: { user, team },
    });
  } catch (error: any) {
    console.error("Error en registro:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al registrar equipo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}