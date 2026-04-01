import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { formatarReais, calcularPremios } from "@/lib/prize";
import { ordenarClassificacao } from "@/lib/pontuacao";
import { ChevronRight, Trophy } from "lucide-react";
import { AdminMarcarPago } from "@/components/admin-marcar-pago";

export default async function AdminPremiosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entrar");

  const admin = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { nome: true, role: true, pago: true },
  });
  if (admin?.role !== "admin") redirect("/dashboard");

  const totalParticipantes = await prisma.usuario.count({ where: { pago: true } });
  const premios = calcularPremios(totalParticipantes);

  const pontuacoes = await prisma.pontuacao.findMany({
    include: {
      usuario: { select: { id: true, nome: true, email: true, chavePix: true, criadoEm: true } },
    },
    where: { usuario: { pago: true } },
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

  const top3 = ordenarClassificacao(entradas).slice(0, 3).map((e, i) => ({
    posicao: i + 1,
    ...e,
    chavePix: pontuacoes.find((p) => p.usuarioId === e.usuarioId)?.usuario.chavePix,
    valorCentavos: i === 0 ? premios.primeiro : i === 1 ? premios.segundo : premios.terceiro,
  }));

  // Premios já registrados
  const premiosRegistrados = await prisma.premio.findMany({
    where: { posicao: { in: [1, 2, 3] } },
  });
  const pagoPorPosicao = new Map(premiosRegistrados.map((p) => [p.posicao, p.pago]));

  return (
    <>
      <Navbar userRole="admin" userName={admin.nome} pago={admin.pago} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">Admin</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Prêmios</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Distribuição de Prêmios</h1>
        <p className="mb-6 text-sm text-gray-500">
          {totalParticipantes} participantes · Pool total: {formatarReais(premios.totalArrecadadoCentavos)}
        </p>

        <div className="space-y-4">
          {top3.map((vencedor) => {
            const medais = ["🥇", "🥈", "🥉"];
            const pago = pagoPorPosicao.get(vencedor.posicao) ?? false;

            return (
              <div key={vencedor.posicao} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{medais[vencedor.posicao - 1]}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{vencedor.nome}</div>
                    <div className="text-sm text-gray-500">{vencedor.totalPontos} pts</div>
                    {vencedor.chavePix ? (
                      <div className="mt-1 text-xs text-gray-400">
                        PIX: <span className="font-mono">{vencedor.chavePix}</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-red-500">
                        Chave PIX não cadastrada
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-green">
                      {formatarReais(vencedor.valorCentavos)}
                    </div>
                    {pago ? (
                      <span className="badge-green text-xs">Pago</span>
                    ) : (
                      <AdminMarcarPago
                        usuarioId={vencedor.usuarioId}
                        posicao={vencedor.posicao}
                        valorCentavos={vencedor.valorCentavos}
                        totalPontos={vencedor.totalPontos}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {top3.length === 0 && (
          <div className="card p-8 text-center text-gray-500">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p>Nenhum participante pontuou ainda.</p>
          </div>
        )}
      </main>
    </>
  );
}
