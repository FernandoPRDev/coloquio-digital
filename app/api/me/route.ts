export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json(
                { ok: false, message: "No hay sesión activa." },
                { status: 401 }
            );
        }

        const session = await verifySessionToken(token);

        return NextResponse.json({
            ok: true,
            user: session,
        });
    } catch {
        return NextResponse.json(
            { ok: false, message: "Sesión inválida." },
            { status: 401 }
        );
    }
}