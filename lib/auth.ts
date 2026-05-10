import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export type SessionPayload = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "TEAM" | "TEACHER";
};

export async function signSessionToken(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(secret);
}

export async function verifySessionToken(token: string) {
    const { payload } = await jwtVerify(token, secret);

    return payload as SessionPayload;
}