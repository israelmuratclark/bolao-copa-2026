import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const count = await prisma.usuario.count();
    await prisma.$disconnect();
    return NextResponse.json({ ok: true, count, db: process.env.DATABASE_URL?.substring(0, 50) });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ ok: false, error: err.message, db: process.env.DATABASE_URL?.substring(0, 50) }, { status: 500 });
  }
}
