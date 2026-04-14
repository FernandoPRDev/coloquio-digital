import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ROOMS = ["Sala A", "Sala B", "Sala C", "Sala D", "Sala E"];

export async function POST() {
  try {
    const createdRooms = [];

    for (const name of ROOMS) {
      const room = await prisma.room.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      createdRooms.push(room);
    }

    return NextResponse.json({
      ok: true,
      message: "Salas creadas correctamente",
      rooms: createdRooms,
    });
  } catch (error: any) {
    console.error("Error al crear salas:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear salas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}