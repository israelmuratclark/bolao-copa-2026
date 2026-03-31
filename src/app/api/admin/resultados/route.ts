import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calcularPontos } from "@/lib/pontuacao";
import { z } from "zod";

const schema = z.object({
  jogoId: z.number().int().positive(),
  golsMandante: z.number().int().min(0).max(99),
  golsVisitante: z.number().int().min(0).max(99),
  resultadoProrrogacao: z.boolean().optional().default(false),
  resultadoPenaltis: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado." }, { status: 401 });
  }

  // Verificar role admin
  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { role: true },
  });

  if (usuario?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Acesso negado." }, { status: 403 });
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

  const { jogoId, golsMandante, golsVisitante, resultadoProrrogacao, resultadoPenaltis } = parsed.data;

  // Verificar se jogo existe
  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } });
  if (!jogo) {
    return NextResponse.json({ success: false, error: "Jogo não encontrado." }, { status: 404 });
  }

  // Atualizar o jogo com o resultado
  await prisma.jogo.update({
    where: { id: jogoId },
    data: {
      golsMandante,
      golsVisitante,
      resultadoProrrogacao,
      resultadoPenaltis,
      status: "encerrado",
    },
  });

  // Buscar todas as apostas deste jogo
  const apostas = await prisma.aposta.findMany({
    where: { jogoId },
    include: { usuario: true },
  });

  // Calcular pontos para cada aposta e atualizar pontuações
  for (const aposta of apostas) {
    const { pontos, tipo } = calcularPontos(
      { golsMandante: aposta.golsMandante, golsVisitante: aposta.golsVisitante },
      { golsMandante, golsVisitante }
    );

    // Atualizar aposta
    await prisma.aposta.update({
      where: { id: aposta.id },
      data: {
        pontosObtidos: pontos,
        calculadoEm: new Date(),
      },
    });

    // Atualizar pontuação acumulada do usuário
    await prisma.pontuacao.upsert({
      where: { usuarioId: aposta.usuarioId },
      update: {
        totalPontos: { increment: pontos },
        acertosExatos: tipo === "exato" ? { increment: 1 } : undefined,
        acertosParciais:
          tipo === "vencedor" || tipo === "empate" ? { increment: 1 } : undefined,
        jogosApostados: { increment: 1 },
      },
      create: {
        usuarioId: aposta.usuarioId,
        totalPontos: pontos,
        acertosExatos: tipo === "exato" ? 1 : 0,
        acertosParciais: tipo === "vencedor" || tipo === "empate" ? 1 : 0,
        jogosApostados: 1,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      jogoId,
      apostasProcessadas: apostas.length,
      golsMandante,
      golsVisitante,
    },
  });
}
