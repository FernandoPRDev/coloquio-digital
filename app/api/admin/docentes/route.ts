import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, roomId } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe un usuario con ese correo",
        },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        {
          ok: false,
          message: "La sala seleccionada no existe",
        },
        { status: 404 }
      );
    }

    const teacherAlreadyAssigned = await prisma.user.findFirst({
      where: {
        role: "TEACHER",
        roomId,
      },
    });

    if (teacherAlreadyAssigned) {
      return NextResponse.json(
        {
          ok: false,
          message: "Esa sala ya tiene un docente asignado",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TEACHER",
        status: "ACTIVE",
        roomId,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Docente creado correctamente",
      teacher,
    });
  } catch (error: any) {
    console.error("Error al crear docente:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear docente",
        error: error.message,
      },
      { status: 500 }
    );
  }
}