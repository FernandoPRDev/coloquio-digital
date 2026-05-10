export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { ok: false, message: "Falta el userId." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                team: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Usuario no encontrado." },
                { status: 404 }
            );
        }

        if (user.role === "ADMIN") {
            return NextResponse.json(
                { ok: false, message: "No puedes eliminar un administrador." },
                { status: 403 }
            );
        }

        await prisma.$transaction(async (tx) => {
            if (user.team) {
                await tx.publicComment.deleteMany({
                    where: { teamId: user.team.id },
                });

                await tx.evaluation.deleteMany({
                    where: { teamId: user.team.id },
                });

                await tx.submission.deleteMany({
                    where: { teamId: user.team.id },
                });

                await tx.team.delete({
                    where: { id: user.team.id },
                });
            }

            await tx.user.delete({
                where: { id: userId },
            });
        });

        return NextResponse.json({
            ok: true,
            message: "Usuario, equipo y datos relacionados eliminados correctamente.",
        });
    } catch (error: any) {
        console.error("Error al eliminar usuario:", error);

        return NextResponse.json(
            {
                ok: false,
                message: "Error al eliminar usuario.",
                error: error?.message || "Error desconocido",
            },
            { status: 500 }
        );
    }
}