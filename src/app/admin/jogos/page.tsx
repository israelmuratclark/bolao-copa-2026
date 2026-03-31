import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { formatInTimeZone } from "date-fns-tz";
import { FASES_LABEL } from "@/types";
import type { FaseTorneio } from "@/types";
import { ChevronRight } from "lucide-react";

export default async function AdminJogosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entrar");

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { nome: true, role: true, pago: true },
  });
  if (usuario?.role !== "admin") redirect("/dashboard");

  const jogos = await prisma.jogo.findMany({
    include: { mandante: true, visitante: true },
    orderBy: [{ fase: "asc" }, { numeroJogo: "asc" }],
  });

  const statusBadge = (status: string) => {
    if (status === "encerrado") return <span className="badge-gray">Encerrado</span>;
    if (status === "ao_vivo") return <span className="badge-green">Ao vivo</span>;
    if (status === "cancelado") return <span className="badge-red">Cancelado</span>;
    return <span className="badge-yellow">Agendado</span>;
  };

  // Agrupar por fase
  const porFase = new Map<FaseTorneio, typeof jogos>();
  for (const j of jogos) {
    const fase = j.fase as FaseTorneio;
    if (!porFase.has(fase)) porFase.set(fase, []);
    porFase.get(fase)!.push(j);
  }

  return (
    <>
      <Navbar userRole="admin" userName={usuario.nome} pago={usuario.pago} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">Admin</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">Jogos</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Gerenciar Jogos</h1>

        {Array.from(porFase.entries()).map(([fase, faseJogos]) => (
          <section key={fase} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {FASES_LABEL[fase]}
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">#</th>
                      <th className="px-4 py-3 text-left text-gray-600">Partida</th>
                      <th className="px-4 py-3 text-left text-gray-600 hidden sm:table-cell">Data/Hora (BRT)</th>
                      <th className="px-4 py-3 text-center text-gray-600">Resultado</th>
                      <th className="px-4 py-3 text-center text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right text-gray-600">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faseJogos.map((jogo) => {
                      const m = jogo.mandante?.nome ?? jogo.mandantePlaceholder ?? "?";
                      const v = jogo.visitante?.nome ?? jogo.visitantePlaceholder ?? "?";
                      return (
                        <tr key={jogo.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400">{jogo.numeroJogo}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {m} × {v}
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                            {formatInTimeZone(
                              jogo.dataHoraUtc,
                              "America/Sao_Paulo",
                              "dd/MM HH:mm"
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">
                            {jogo.status === "encerrado" && jogo.golsMandante != null
                              ? `${jogo.golsMandante}×${jogo.golsVisitante}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {statusBadge(jogo.status)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/jogos/${jogo.id}`}
                              className="text-xs text-brand-green hover:underline"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
