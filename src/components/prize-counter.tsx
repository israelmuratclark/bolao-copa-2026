"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatarReais } from "@/lib/prize";
import { Trophy } from "lucide-react";

type PrizeCounterProps = {
  initialCount: number;
};

export function PrizeCounter({ initialCount }: PrizeCounterProps) {
  const [count, setCount] = useState(initialCount);
  const TAXA = 1000; // R$ 10,00

  useEffect(() => {
    const supabase = createClient();

    // Supabase Realtime — escuta INSERT em usuarios com pago=true
    const channel = supabase
      .channel("prize-counter")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usuarios",
          filter: "pago=eq.true",
        },
        () => {
          setCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const premio = {
    total: count * TAXA,
    primeiro: Math.floor(count * TAXA * 0.5),
    segundo: Math.floor(count * TAXA * 0.3),
    terceiro: Math.floor(count * TAXA * 0.2),
  };

  return (
    <div className="rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/5 to-brand-yellow/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-brand-yellow" />
        <h3 className="font-semibold text-gray-900">Prêmio Estimado</h3>
        <span className="badge-green ml-auto">Ao vivo</span>
      </div>

      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">{count} participante{count !== 1 ? "s" : ""}</p>
        <p className="mt-1 text-4xl font-bold text-brand-green">
          {formatarReais(premio.total)}
        </p>
        <p className="text-sm text-gray-400">pool total</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <div className="text-lg">🥇</div>
          <div className="text-sm font-bold text-gray-900">{formatarReais(premio.primeiro)}</div>
          <div className="text-xs text-gray-500">1º lugar</div>
        </div>
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <div className="text-lg">🥈</div>
          <div className="text-sm font-bold text-gray-900">{formatarReais(premio.segundo)}</div>
          <div className="text-xs text-gray-500">2º lugar</div>
        </div>
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <div className="text-lg">🥉</div>
          <div className="text-sm font-bold text-gray-900">{formatarReais(premio.terceiro)}</div>
          <div className="text-xs text-gray-500">3º lugar</div>
        </div>
      </div>
    </div>
  );
}
