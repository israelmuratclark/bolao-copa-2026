import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { role: true },
  });

  if (usuario?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const jogo = await prisma.jogo.findUnique({
    where: { id: Number(id) },
    include: { mandante: true, visitante: true },
  });

  if (!jogo) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }

  return NextResponse.json(jogo);
}
