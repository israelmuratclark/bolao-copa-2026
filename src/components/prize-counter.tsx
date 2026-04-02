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
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-brand-yellow" />
        <h3 className="font-semibold text-white">Prêmio Estimado</h3>
        <span className="badge-green ml-auto">Ao vivo</span>
      </div>

      <div className="mb-4 text-center">
        <p className="text-sm text-white/70">{count} participante{count !== 1 ? "s" : ""}</p>
        <p className="mt-1 text-4xl font-bold text-brand-yellow">
          {formatarReais(premio.total)}
        </p>
        <p className="text-sm text-white/60">total arrecadado</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/15 p-3 text-center">
          <div className="text-lg">🥇</div>
          <div className="text-sm font-bold text-white">{formatarReais(premio.primeiro)}</div>
          <div className="text-xs text-white/60">1º lugar</div>
        </div>
        <div className="rounded-lg bg-white/15 p-3 text-center">
          <div className="text-lg">🥈</div>
          <div className="text-sm font-bold text-white">{formatarReais(premio.segundo)}</div>
          <div className="text-xs text-white/60">2º lugar</div>
        </div>
        <div className="rounded-lg bg-white/15 p-3 text-center">
          <div className="text-lg">🥉</div>
          <div className="text-sm font-bold text-white">{formatarReais(premio.terceiro)}</div>
          <div className="text-xs text-white/60">3º lugar</div>
        </div>
      </div>
    </div>
  );
}
