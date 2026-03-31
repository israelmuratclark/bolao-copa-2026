import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  jogoId: z.number().int().positive(),
  golsMandante: z.number().int().min(0).max(99),
  golsVisitante: z.number().int().min(0).max(99),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corpo inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
  }

  const { jogoId, golsMandante, golsVisitante } = parsed.data;

  // Verificar se usuário pagou
  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { id: true, pago: true },
  });

  if (!usuario) {
    return NextResponse.json({ success: false, error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!usuario.pago) {
    return NextResponse.json(
      { success: false, error: "Inscrição não paga. Realize o pagamento para apostar." },
      { status: 403 }
    );
  }

  // Verificar prazo de apostas (server-side enforcement)
  const jogo = await prisma.jogo.findUnique({
    where: { id: jogoId },
    select: { id: true, prazoApostas: true, status: true },
  });

  if (!jogo) {
    return NextResponse.json({ success: false, error: "Jogo não encontrado." }, { status: 404 });
  }

  if (jogo.status !== "agendado") {
    return NextResponse.json(
      { success: false, error: "Este jogo não está mais aceitando apostas." },
      { status: 400 }
    );
  }

  if (new Date() >= new Date(jogo.prazoApostas)) {
    return NextResponse.json(
      { success: false, error: "O prazo para apostas deste jogo já encerrou." },
      { status: 400 }
    );
  }

  // Upsert da aposta
  const aposta = await prisma.aposta.upsert({
    where: {
      usuarioId_jogoId: {
        usuarioId: usuario.id,
        jogoId,
      },
    },
    update: {
      golsMandante,
      golsVisitante,
    },
    create: {
      usuarioId: usuario.id,
      jogoId,
      golsMandante,
      golsVisitante,
    },
  });

  // Garantir que pontuacao row existe para o usuário
  await prisma.pontuacao.upsert({
    where: { usuarioId: usuario.id },
    update: {},
    create: {
      usuarioId: usuario.id,
      totalPontos: 0,
      acertosExatos: 0,
      acertosParciais: 0,
      jogosApostados: 0,
    },
  });

  return NextResponse.json({ success: true, data: aposta });
}
