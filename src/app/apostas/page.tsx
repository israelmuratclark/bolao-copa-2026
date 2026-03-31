import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { MatchCard } from "@/components/match-card";
import { FASES_LABEL, FASES_ORDEM } from "@/types";
import type { FaseTorneio } from "@/types";

export default async function ApostasPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/entrar");

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { id: true, nome: true, role: true, pago: true },
  });

  if (!usuario) redirect("/entrar");

  // Buscar todos os jogos com seleções
  const jogos = await prisma.jogo.findMany({
    include: { mandante: true, visitante: true },
    orderBy: [{ fase: "asc" }, { numeroJogo: "asc" }],
  });

  // Buscar apostas do usuário
  const apostas = await prisma.aposta.findMany({
    where: { usuarioId: usuario.id },
  });

  const apostasPorJogo = new Map(apostas.map((a) => [a.jogoId, a]));

  // Agrupar jogos por fase e grupo
  const jogosPorFase = new Map<FaseTorneio, typeof jogos>();
  for (const jogo of jogos) {
    const fase = jogo.fase as FaseTorneio;
    if (!jogosPorFase.has(fase)) jogosPorFase.set(fase, []);
    jogosPorFase.get(fase)!.push(jogo);
  }

  const totalJogosAbertos = jogos.filter(
    (j) => j.status === "agendado" && new Date(j.prazoApostas) > new Date()
  ).length;

  const totalApostas = apostas.length;

  return (
    <>
      <Navbar userRole={usuario.role} userName={usuario.nome} pago={usuario.pago} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apostas</h1>
            <p className="text-sm text-gray-500">
              {totalApostas} de 104 apostas registradas · {totalJogosAbertos} jogos ainda abertos
            </p>
          </div>
          {!usuario.pago && (
            <Link href="/inscricao" className="btn-yellow">
              Pagar inscrição para apostar
            </Link>
          )}
        </div>

        {FASES_ORDEM.map((fase) => {
          const jogosNaFase = jogosPorFase.get(fase);
          if (!jogosNaFase || jogosNaFase.length === 0) return null;

          // Para fase de grupos, agrupar por grupo
          if (fase === "fase_grupos") {
            const grupos = new Map<string, typeof jogos>();
            for (const jogo of jogosNaFase) {
              const g = jogo.grupo ?? "?";
              if (!grupos.has(g)) grupos.set(g, []);
              grupos.get(g)!.push(jogo);
            }

            return (
              <section key={fase} className="mb-10">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  {FASES_LABEL[fase]}
                </h2>
                {Array.from(grupos.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grupo, jogosGrupo]) => (
                    <div key={grupo} className="mb-6">
                      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                        Grupo {grupo}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {jogosGrupo.map((jogo) => (
                          <MatchCard
                            key={jogo.id}
                            jogo={jogo}
                            aposta={apostasPorJogo.get(jogo.id) ?? null}
                            pago={usuario.pago}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </section>
            );
          }

          return (
            <section key={fase} className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {FASES_LABEL[fase]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {jogosNaFase.map((jogo) => (
                  <MatchCard
                    key={jogo.id}
                    jogo={jogo}
                    aposta={apostasPorJogo.get(jogo.id) ?? null}
                    pago={usuario.pago}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
