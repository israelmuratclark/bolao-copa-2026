import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RegulamentoPage() {
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
    userName = usuario?.nome;
    pago = usuario?.pago ?? false;
  }

  return (
    <>
      <Navbar userRole={userRole} userName={userName} pago={pago} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Regulamento do Bolão</h1>
        <p className="mt-2 text-gray-500">Copa do Mundo FIFA 2026</p>

        <div className="mt-8 space-y-8 text-gray-700">
          {/* Participação */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Participação</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>O bolão é aberto a qualquer pessoa que receba o link de convite.</li>
              <li>Para participar, é necessário realizar o pagamento de <strong>R$ 10,00</strong> via PIX.</li>
              <li>O pagamento confirma a participação e libera o acesso para registrar apostas.</li>
              <li>Cada participante pode se cadastrar apenas uma vez.</li>
            </ul>
          </section>

          {/* Apostas */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Apostas</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>Cada participante pode apostar o placar de todos os <strong>104 jogos</strong> da Copa.</li>
              <li>As apostas devem ser registradas até <strong>30 minutos antes do início</strong> de cada jogo.</li>
              <li>Após o prazo, não é possível alterar ou cadastrar novas apostas para aquele jogo.</li>
              <li>Não é obrigatório apostar em todos os jogos — jogos sem aposta somam 0 pontos.</li>
              <li>Para jogos do mata-mata onde os times ainda não foram definidos, as apostas abrem assim que ambas as seleções forem confirmadas.</li>
            </ul>
          </section>

          {/* Pontuação */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Sistema de Pontuação</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Resultado</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3">
                      <strong>Placar exato</strong>
                      <span className="ml-2 text-gray-500">ex.: apostou 2×1, foi 2×1</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-brand-green">10 pts</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <strong>Vencedor correto</strong>
                      <span className="ml-2 text-gray-500">ex.: apostou 2×1, foi 3×0</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">5 pts</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <strong>Empate correto</strong>
                      <span className="ml-2 text-gray-500">ex.: apostou 0×0, foi 1×1</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600">3 pts</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <strong>Resultado errado</strong>
                      <span className="ml-2 text-gray-500">errou quem venceu ou errou o empate</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-400">0 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              <strong>Desempate:</strong> em caso de empate em pontos, o critério de desempate é:
              (1) mais acertos de placar exato, (2) mais acertos parciais, (3) mais jogos apostados,
              (4) data de cadastro mais antiga.
            </p>
          </section>

          {/* Prêmios */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Prêmios</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>O prêmio total corresponde ao número de participantes × R$ 10,00.</li>
              <li>Os <strong>3 primeiros colocados</strong> ao final do torneio serão premiados:</li>
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { pos: "1º", pct: "50%", emoji: "🥇" },
                { pos: "2º", pct: "30%", emoji: "🥈" },
                { pos: "3º", pct: "20%", emoji: "🥉" },
              ].map((p) => (
                <div key={p.pos} className="card p-4 text-center">
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{p.pct}</div>
                  <div className="text-xs text-gray-500">{p.pos} lugar</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              O pagamento dos prêmios será realizado via PIX para a chave cadastrada no perfil de cada vencedor,
              em até 5 dias úteis após o encerramento do torneio.
            </p>
          </section>

          {/* Dúvidas */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Disposições Gerais</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>Em caso de cancelamento de jogo pela FIFA, a partida não contará para pontuação.</li>
              <li>O administrador do bolão reserva-se o direito de corrigir eventuais erros de sistema.</li>
              <li>Este bolão é para fins de entretenimento entre conhecidos.</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          {!session && (
            <Link href="/entrar" className="btn-primary px-8 py-3">
              Quero Participar →
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
