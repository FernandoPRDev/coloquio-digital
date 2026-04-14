export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: "PENDING",
        role: "TEAM",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      ok: true,
      users,
    });
  } catch (error: any) {
    console.error("Error al obtener usuarios pendientes:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener usuarios pendientes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}