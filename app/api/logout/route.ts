import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        ok: true,
        message: "Sesión cerrada correctamente.",
    });

    response.cookies.delete("session");

    return response;
}