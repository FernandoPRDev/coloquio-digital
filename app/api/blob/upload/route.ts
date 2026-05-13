export const runtime = "nodejs";

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_VIDEO_SIZE = 400 * 1024 * 1024; // 400 MB

const ALLOWED_PDF_TYPES = ["application/pdf"];

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/octet-stream",
];

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as HandleUploadBody;

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname, clientPayload) => {
                const payload = clientPayload ? JSON.parse(clientPayload) : null;

                if (!payload?.fileType) {
                    throw new Error("Tipo de archivo no especificado.");
                }

                if (
                    payload.fileType === "pdf" ||
                    payload.fileType === "presentationPdf"
                ) {
                    return {
                        allowedContentTypes: ALLOWED_PDF_TYPES,
                        maximumSizeInBytes: MAX_PDF_SIZE,
                    };
                }

                if (payload.fileType === "video") {
                    return {
                        allowedContentTypes: ALLOWED_VIDEO_TYPES,
                        maximumSizeInBytes: MAX_VIDEO_SIZE,
                    };
                }

                throw new Error("Tipo de archivo no permitido.");
            },
            onUploadCompleted: async () => { },
        });

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        console.error("Error en autorización Blob:", error);

        return NextResponse.json(
            {
                ok: false,
                message: error?.message || "Error al autorizar la subida.",
            },
            { status: 400 }
        );
    }
}