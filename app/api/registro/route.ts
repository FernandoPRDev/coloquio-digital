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

    const rooms = await prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
    });

    if (rooms.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No hay salas configuradas. El administrador debe crear las salas primero.",
        },
        { status: 400 }
      );
    }

    const roomsWithTeams = await prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        teams: true,
      },
    });

    const assignedRoom = roomsWithTeams.find((room) => room.teams.length < 5);

    if (!assignedRoom) {
      return NextResponse.json(
        {
          ok: false,
          message: "Se alcanzó el límite máximo de 25 equipos.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: representativeName,
          email,
          password: hashedPassword,
          role: Role.TEAM,
        },
      });

      const team = await tx.team.create({
        data: {
          teamName,
          projectName,
          category,
          members,
          userId: user.id,
          roomId: assignedRoom.id,
        },
      });

      await tx.evaluation.create({
        data: {
          teamId: team.id,
        },
      });

      return { user, team };
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario y equipo creados correctamente",
      data: {
        user: result.user,
        team: result.team,
        room: assignedRoom,
      },
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