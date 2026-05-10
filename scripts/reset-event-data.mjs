import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Limpiando datos del evento...");

    await prisma.publicComment.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.team.deleteMany();

    await prisma.user.deleteMany({
        where: {
            role: {
                not: "ADMIN",
            },
        },
    });

    await prisma.user.updateMany({
        where: {
            role: "ADMIN",
        },
        data: {
            status: "ACTIVE",
            roomId: null,
        },
    });

    await prisma.room.deleteMany();

    for (let i = 1; i <= 10; i++) {
        await prisma.room.create({
            data: {
                name: `Sala ${i}`,
            },
        });
    }

    await prisma.eventSettings.deleteMany();

    await prisma.eventSettings.create({
        data: {
            expositionEnabled: false,
            submissionDeadline: null,
            expositionOpenAt: null,
        },
    });

    console.log("Listo. Se conservaron los ADMIN y se crearon 10 salas.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });