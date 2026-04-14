import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

type RoomWithRelations = {
  id: string;
  name: string;
  teams: { id: string }[];
  teachers: { id: string }[];
};

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

    const rooms = (await prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        teams: true,
        teachers: true,
      },
    })) as RoomWithRelations[];

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

    const availableRooms = rooms.filter(
      (room: RoomWithRelations) => room.teams.length < 5
    );

    if (availableRooms.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Se alcanzó el límite máximo de 25 equipos.",
        },
        { status: 400 }
      );
    }

    const roomsWithTeacher = availableRooms.filter(
      (room: RoomWithRelations) => room.teachers.length > 0
    );

    const roomsWithoutTeacher = availableRooms.filter(
      (room: RoomWithRelations) => room.teachers.length === 0
    );

    const sortByLoadAndName = (
      a: RoomWithRelations,
      b: RoomWithRelations
    ) => {
      if (a.teams.length !== b.teams.length) {
        return a.teams.length - b.teams.length;
      }

      return a.name.localeCompare(b.name);
    };

    const assignedRoom =
      [...roomsWithTeacher].sort(sortByLoadAndName)[0] ??
      [...roomsWithoutTeacher].sort(sortByLoadAndName)[0];

    if (!assignedRoom) {
      return NextResponse.json(
        {
          ok: false,
          message: "No fue posible asignar una sala.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: representativeName,
        email,
        password: hashedPassword,
        role: "TEAM",
      },
    });

    const team = await prisma.team.create({
      data: {
        teamName,
        projectName,
        category,
        members,
        userId: user.id,
        roomId: assignedRoom.id,
      },
    });

    await prisma.evaluation.create({
      data: {
        teamId: team.id,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario y equipo creados correctamente",
      data: {
        user,
        team,
        room: {
          id: assignedRoom.id,
          name: assignedRoom.name,
        },
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