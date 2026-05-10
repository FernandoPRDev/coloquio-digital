import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    const pathname = request.nextUrl.pathname;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const session = await verifySessionToken(token);

        if (pathname.startsWith("/dashboard/admin") && session.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (
            pathname.startsWith("/dashboard/docente") &&
            session.role !== "TEACHER"
        ) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (pathname.startsWith("/dashboard/equipo") && session.role !== "TEAM") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*"],
};