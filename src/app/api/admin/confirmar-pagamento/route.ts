import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { role: true },
  });

  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { usuarioId } = await req.json();

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: usuarioId },
      data: { pago: true },
    }),
    prisma.pontuacao.upsert({
      where: { usuarioId },
      update: {},
      create: {
        usuarioId,
        totalPontos: 0,
        acertosExatos: 0,
        acertosParciais: 0,
        jogosApostados: 0,
      },
    }),
    prisma.pagamento.create({
      data: {
        usuarioId,
        tipo: "inscricao",
        valorCentavos: 1000,
        status: "aprovado",
        provedor: "manual",
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
