import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ordenarClassificacao } from "@/lib/pontuacao";

export async function GET() {
  const pontuacoes = await prisma.pontuacao.findMany({
    include: {
      usuario: {
        select: { id: true, nome: true, pago: true, criadoEm: true },
      },
    },
    where: {
      usuario: { pago: true },
    },
  });

  const entradas = pontuacoes.map((p) => ({
    usuarioId: p.usuario.id,
    nome: p.usuario.nome,
    totalPontos: p.totalPontos,
    acertosExatos: p.acertosExatos,
    acertosParciais: p.acertosParciais,
    jogosApostados: p.jogosApostados,
    criadoEm: new Date(p.usuario.criadoEm),
  }));

  const ordenado = ordenarClassificacao(entradas).map((e, i) => ({
    posicao: i + 1,
    ...e,
  }));

  return NextResponse.json(ordenado);
}
