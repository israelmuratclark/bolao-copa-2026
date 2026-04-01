import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { formatarReais, calcularPremios } from "@/lib/prize";
import { ordenarClassificacao } from "@/lib/pontuacao";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Trophy, Target, Clock, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/entrar");

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    include: { pontuacao: true },
  });

  if (!usuario) redirect("/entrar");

  const totalParticipantes = await prisma.usuario.count({ where: { pago: true } });
  const premios = calcularPremios(totalParticipantes);

  // Calcular posição do usuário
  let posicao: number | null = null;
  if (usuario.pago && usuario.pontuacao) {
    const pontuacoes = await prisma.pontuacao.findMany({
      include: { usuario: { select: { id: true, criadoEm: true } } },
      where: { usuario: { pago: true } },
    });
    const entradas = pontuacoes.map((p) => ({
      usuarioId: p.usuario.id,
      nome: "",
      totalPontos: p.totalPontos,
      acertosExatos: p.acertosExatos,
      acertosParciais: p.acertosParciais,
      jogosApostados: p.jogosApostados,
      criadoEm: new Date(p.usuario.criadoEm),
    }));
    const ordenado = ordenarClassificacao(entradas);
    posicao = ordenado.findIndex((e) => e.usuarioId === usuario.id) + 1 || null;
  }

  // Próximos 5 jogos abertos para apostas
  const proximosJogos = await prisma.jogo.findMany({
    where: {
      status: "agendado",
      prazoApostas: { gt: new Date() },
    },
    include: { mandante: true, visitante: true },
    orderBy: { dataHoraUtc: "asc" },
    take: 5,
  });

  // Últimas 5 apostas do usuário
  const ultimasApostas = await prisma.aposta.findMany({
    where: { usuarioId: usuario.id },
    include: { jogo: { include: { mandante: true, visitante: true } } },
    orderBy: { criadoEm: "desc" },
    take: 5,
  });

  const totalApostas = await prisma.aposta.count({ where: { usuarioId: usuario.id } });

  const premioUsuario =
    posicao === 1 ? premios.primeiro :
    posicao === 2 ? premios.segundo :
    posicao === 3 ? premios.terceiro : null;

  return (
    <>
      <Navbar userRole={usuario.role} userName={usuario.nome} pago={usuario.pago} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Alerta de pagamento pendente */}
        {!usuario.pago && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Inscrição pendente</p>
              <p className="text-sm text-yellow-700">
                Pague R$ 10,00 via PIX para confirmar sua participação e liberar as apostas.
              </p>
            </div>
            <Link href="/inscricao" className="btn-yellow flex-shrink-0 py-2 text-sm">
              Pagar agora
            </Link>
          </div>
        )}

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Olá, {usuario.nome.split(" ")[0]}!
        </h1>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card p-4">
            <div className="text-xs text-gray-500">Sua posição</div>
            <div className="mt-1 text-2xl font-bold text-brand-green">
              {posicao ? `${posicao}º` : "—"}
            </div>
            <div className="text-xs text-gray-400">de {totalParticipantes}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">Pontuação</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {usuario.pontuacao?.totalPontos ?? 0}
            </div>
            <div className="text-xs text-gray-400">pontos</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">Acertos exatos</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {usuario.pontuacao?.acertosExatos ?? 0}
            </div>
            <div className="text-xs text-gray-400">placares exatos</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">Apostas feitas</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {totalApostas}
            </div>
            <div className="text-xs text-gray-400">de 104 jogos</div>
          </div>
        </div>

        {/* Prêmio se top 3 */}
        {premioUsuario && posicao && (
          <div className="mb-8 flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-green to-brand-green-dark p-4 text-white">
            <Trophy className="h-8 w-8 flex-shrink-0 text-brand-yellow" />
            <div>
              <p className="font-semibold">
                Você está em {posicao}º lugar! Prêmio estimado:
              </p>
              <p className="text-2xl font-bold text-brand-yellow">
                {formatarReais(premioUsuario)}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Próximos jogos */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Próximos Jogos</h2>
              {usuario.pago && (
                <Link href="/apostas" className="text-sm text-brand-green hover:underline">
                  Ver todos →
                </Link>
              )}
            </div>
            {proximosJogos.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm">Nenhum jogo agendado no momento</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proximosJogos.map((jogo) => {
                  const m = jogo.mandante?.nome ?? jogo.mandantePlaceholder ?? "?";
                  const v = jogo.visitante?.nome ?? jogo.visitantePlaceholder ?? "?";
                  return (
                    <div key={jogo.id} className="card flex items-center gap-3 p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          {formatInTimeZone(
                            jogo.dataHoraUtc,
                            "America/Sao_Paulo",
                            "dd/MM",
                            { locale: ptBR }
                          )}
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                          {formatInTimeZone(
                            jogo.dataHoraUtc,
                            "America/Sao_Paulo",
                            "HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                      <div className="flex-1 text-sm font-medium text-gray-900 truncate">
                        {m} × {v}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimas apostas */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Minhas Apostas</h2>
              {usuario.pago && (
                <Link href="/apostas" className="text-sm text-brand-green hover:underline">
                  Ver todas →
                </Link>
              )}
            </div>
            {ultimasApostas.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                <Target className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm">
                  {usuario.pago
                    ? "Você ainda não registrou nenhuma aposta."
                    : "Pague a inscrição para começar a apostar."}
                </p>
                {usuario.pago && (
                  <Link href="/apostas" className="mt-2 inline-block text-sm text-brand-green hover:underline">
                    Apostar agora →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {ultimasApostas.map((aposta) => {
                  const m = aposta.jogo.mandante?.nome ?? aposta.jogo.mandantePlaceholder ?? "?";
                  const v = aposta.jogo.visitante?.nome ?? aposta.jogo.visitantePlaceholder ?? "?";
                  const encerrado = aposta.jogo.status === "encerrado";
                  return (
                    <div key={aposta.id} className="card flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                          {m} × {v}
                        </p>
                        <p className="text-xs text-gray-500">
                          Palpite: {aposta.golsMandante}×{aposta.golsVisitante}
                        </p>
                      </div>
                      <div className="text-right">
                        {encerrado && aposta.pontosObtidos != null ? (
                          <span className={`text-sm font-bold ${aposta.pontosObtidos > 0 ? "text-brand-green" : "text-gray-400"}`}>
                            +{aposta.pontosObtidos} pts
                          </span>
                        ) : (
                          <span className="badge-gray">Pendente</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
