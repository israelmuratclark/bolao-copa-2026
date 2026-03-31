import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrizeCounter } from "@/components/prize-counter";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, Trophy, BarChart2, Clock } from "lucide-react";
import { formatarReais } from "@/lib/prize";

async function getTotalParticipantes() {
  return prisma.usuario.count({ where: { pago: true } });
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let userRole: "participante" | "admin" | undefined;
  let userName: string | undefined;
  let pago = false;

  if (session) {
    const usuario = await prisma.usuario.findUnique({
      where: { authId: session.user.id },
      select: { nome: true, role: true, pago: true },
    });
    userRole = usuario?.role ?? "participante";
    userName = usuario?.nome ?? session.user.email ?? undefined;
    pago = usuario?.pago ?? false;
  }

  const totalParticipantes = await getTotalParticipantes();

  const howItWorks = [
    {
      icon: "1",
      title: "Cadastre-se e pague",
      desc: "Crie sua conta e pague R$ 10,00 via PIX para confirmar sua participação.",
    },
    {
      icon: "2",
      title: "Aposte nos placares",
      desc: "Palpite o placar de cada um dos 104 jogos da Copa antes do início de cada partida.",
    },
    {
      icon: "3",
      title: "Acompanhe a classificação",
      desc: "Veja sua posição em tempo real à medida que os jogos acontecem.",
    },
    {
      icon: "4",
      title: "Ganhe prêmios",
      desc: "Os 3 primeiros do ranking dividem o prêmio: 50%, 30% e 20% do total arrecadado.",
    },
  ];

  return (
    <>
      <Navbar userRole={userRole} userName={userName} pago={pago} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue to-blue-800 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand-yellow" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-green" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-brand-yellow animate-pulse" />
                  Copa do Mundo 2026 — EUA, Canadá e México
                </div>
                <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                  O Bolão da<br />
                  <span className="text-brand-yellow">Copa 2026</span>
                </h1>
                <p className="mt-6 text-lg text-blue-100">
                  Aposte nos placares dos 104 jogos, acompanhe a classificação
                  em tempo real e concorra a prêmios com seus amigos.
                  <strong className="text-white"> Apenas R$ 10,00</strong> para participar.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {session ? (
                    pago ? (
                      <Link href="/apostas" className="btn-yellow px-6 py-3 text-base">
                        Fazer Apostas →
                      </Link>
                    ) : (
                      <Link href="/inscricao" className="btn-yellow px-6 py-3 text-base">
                        Pagar Inscrição — R$ 10,00
                      </Link>
                    )
                  ) : (
                    <>
                      <Link href="/entrar" className="btn-yellow px-6 py-3 text-base">
                        Quero Participar →
                      </Link>
                      <Link href="/regulamento" className="btn-secondary px-6 py-3 text-base">
                        Ver Regulamento
                      </Link>
                    </>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Pagamento via PIX
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    104 jogos para apostar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Top 3 premiados
                  </span>
                </div>
              </div>

              <div>
                <PrizeCounter initialCount={totalParticipantes} />
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="mt-3 text-center text-gray-500">
              Simples, divertido e transparente.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step) => (
                <div key={step.icon} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-xl font-bold text-white">
                    {step.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pontuação */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Sistema de Pontuação
            </h2>
            <p className="mt-3 text-center text-gray-500">
              Quanto mais preciso seu palpite, mais pontos você ganha.
            </p>
            <div className="mt-10 space-y-3">
              {[
                {
                  pts: 10,
                  label: "Placar exato",
                  desc: "Ex.: apostou 2×1 e foi 2×1",
                  color: "bg-brand-green",
                },
                {
                  pts: 5,
                  label: "Vencedor correto",
                  desc: "Ex.: apostou 2×1 e foi 3×0",
                  color: "bg-blue-500",
                },
                {
                  pts: 3,
                  label: "Empate correto",
                  desc: "Ex.: apostou 0×0 e foi 1×1",
                  color: "bg-purple-500",
                },
                {
                  pts: 0,
                  label: "Resultado errado",
                  desc: "Errou quem venceu ou errou o empate",
                  color: "bg-gray-400",
                },
              ].map((item) => (
                <div
                  key={item.pts}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${item.color} text-xl font-bold text-white`}
                  >
                    {item.pts}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <div className="ml-auto text-sm font-bold text-gray-700">
                    {item.pts} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-brand-green py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-brand-yellow" />
            <h2 className="text-3xl font-bold">Pronto para participar?</h2>
            <p className="mt-3 text-green-100">
              Com {totalParticipantes} participante{totalParticipantes !== 1 ? "s" : ""}, o prêmio já é{" "}
              <strong className="text-brand-yellow">{formatarReais(totalParticipantes * 1000)}</strong>.
              Cada novo participante aumenta o prêmio de todos!
            </p>
            {!session && (
              <Link href="/entrar" className="mt-8 inline-block rounded-xl bg-brand-yellow px-8 py-3 text-lg font-bold text-gray-900 transition-colors hover:bg-yellow-300">
                Entrar com R$ 10,00 →
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>Bolão Copa 2026 · Feito para diversão entre amigos</p>
          <p className="mt-1">
            <Link href="/regulamento" className="hover:text-gray-700">Regulamento</Link>
            {" · "}
            <Link href="/classificacao" className="hover:text-gray-700">Classificação</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
