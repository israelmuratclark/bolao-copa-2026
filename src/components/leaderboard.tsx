"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Medal } from "lucide-react";

type EntradaLeaderboard = {
  posicao: number;
  usuarioId: string;
  nome: string;
  totalPontos: number;
  acertosExatos: number;
  acertosParciais: number;
  jogosApostados: number;
};

type LeaderboardProps = {
  dados: EntradaLeaderboard[];
  usuarioLogadoId?: string;
};

function iconePositao(pos: number) {
  if (pos === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (pos === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (pos === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="w-5 text-center text-sm text-gray-500">{pos}</span>;
}

export function Leaderboard({ dados, usuarioLogadoId }: LeaderboardProps) {
  const [entradas, setEntradas] = useState(dados);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pontuacoes",
        },
        async () => {
          // Rebusca a classificação atualizada
          const res = await fetch("/api/classificacao");
          if (res.ok) {
            const data = await res.json();
            setEntradas(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (entradas.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-500">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="font-medium">Nenhuma pontuação ainda</p>
        <p className="mt-1 text-sm">Os resultados aparecerão aqui conforme os jogos forem concluídos.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Participante</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Pts</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-gray-600 sm:table-cell">Exatos</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-gray-600 md:table-cell">Parciais</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-gray-600 lg:table-cell">Jogos</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((e) => {
              const isLogado = e.usuarioId === usuarioLogadoId;
              const isTop3 = e.posicao <= 3;

              return (
                <tr
                  key={e.usuarioId}
                  className={`border-b border-gray-50 transition-colors ${
                    isLogado ? "bg-brand-green/5" : isTop3 ? "bg-yellow-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">{iconePositao(e.posicao)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${isLogado ? "text-brand-green" : "text-gray-900"}`}>
                      {e.nome}
                      {isLogado && <span className="ml-1.5 text-xs text-brand-green">(você)</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{e.totalPontos}</td>
                  <td className="hidden px-4 py-3 text-right text-gray-600 sm:table-cell">
                    {e.acertosExatos}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-gray-600 md:table-cell">
                    {e.acertosParciais}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-gray-500 lg:table-cell">
                    {e.jogosApostados}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
