import { Navbar } from "@/components/navbar";
import { Leaderboard } from "@/components/leaderboard";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ordenarClassificacao } from "@/lib/pontuacao";
import { formatarReais, calcularPremios } from "@/lib/prize";
import { Trophy } from "lucide-react";

export const revalidate = 60; // revalida a cada 60s (SSR + ISR)

export default async function ClassificacaoPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let userRole: "participante" | "admin" | undefined;
  let userName: string | undefined;
  let pago = false;
  let usuarioLogadoId: string | undefined;

  if (session) {
    const usuario = await prisma.usuario.findUnique({
      where: { authId: session.user.id },
      select: { id: true, nome: true, role: true, pago: true },
    });
    userRole = usuario?.role ?? "participante";
    userName = usuario?.nome;
    pago = usuario?.pago ?? false;
    usuarioLogadoId = usuario?.id;
  }

  // Buscar pontuações
  const pontuacoes = await prisma.pontuacao.findMany({
    include: {
      usuario: {
        select: { id: true, nome: true, pago: true, criadoEm: true },
      },
    },
    where: { usuario: { pago: true } },
  });

  const totalParticipantes = await prisma.usuario.count({ where: { pago: true } });
  const premios = calcularPremios(totalParticipantes);

  const entradas = pontuacoes.map((p) => ({
    usuarioId: p.usuario.id,
    nome: p.usuario.nome,
    totalPontos: p.totalPontos,
    acertosExatos: p.acertosExatos,
    acertosParciais: p.acertosParciais,
    jogosApostados: p.jogosApostados,
    criadoEm: new Date(p.usuario.criadoEm),
  }));

  const classificacao = ordenarClassificacao(entradas).map((e, i) => ({
    posicao: i + 1,
    ...e,
  }));

  return (
    <>
      <Navbar userRole={userRole} userName={userName} pago={pago} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classificação Geral</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalParticipantes} participante{totalParticipantes !== 1 ? "s" : ""} · Atualizada em tempo real
            </p>
          </div>

          {/* Mini prize display */}
          <div className="flex items-center gap-3 rounded-xl bg-brand-green/5 border border-brand-green/20 px-4 py-3">
            <Trophy className="h-5 w-5 text-brand-yellow" />
            <div>
              <p className="text-xs text-gray-500">Prêmio total</p>
              <p className="text-lg font-bold text-brand-green">
                {formatarReais(premios.premioLiquidoCentavos)}
              </p>
            </div>
          </div>
        </div>

        {/* Pódio (top 3) */}
        {classificacao.length >= 3 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[classificacao[1], classificacao[0], classificacao[2]].map((e, i) => {
              const medalhas = ["🥈", "🥇", "🥉"];
              const premioValor = i === 1 ? premios.primeiro : i === 0 ? premios.segundo : premios.terceiro;
              const bg = i === 1 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200";
              return (
                <div key={e.usuarioId} className={`card border ${bg} p-3 text-center ${i === 1 ? "sm:-mt-4" : ""}`}>
                  <div className="text-2xl">{medalhas[i]}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900 truncate">{e.nome}</div>
                  <div className="text-lg font-bold text-gray-900">{e.totalPontos} pts</div>
                  <div className="text-xs font-medium text-brand-green">{formatarReais(premioValor)}</div>
                </div>
              );
            })}
          </div>
        )}

        <Leaderboard dados={classificacao} usuarioLogadoId={usuarioLogadoId} />

        <p className="mt-4 text-center text-xs text-gray-400">
          Desempate: acertos exatos → acertos parciais → jogos apostados → data de cadastro
        </p>
      </main>
    </>
  );
}
