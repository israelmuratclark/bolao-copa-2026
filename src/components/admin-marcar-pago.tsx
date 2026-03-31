"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  usuarioId: string;
  posicao: number;
  valorCentavos: number;
  totalPontos: number;
};

export function AdminMarcarPago({ usuarioId, posicao, valorCentavos, totalPontos }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarcar = async () => {
    const valor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorCentavos / 100);
    if (!confirm(`Marcar prêmio de ${valor} para ${posicao}º lugar como pago?`)) return;
    setLoading(true);

    await fetch("/api/admin/premios/marcar-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, posicao, valorCentavos, totalPontos }),
    });

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleMarcar}
      disabled={loading}
      className="badge-yellow cursor-pointer hover:bg-yellow-200 transition-colors"
    >
      {loading ? "..." : "Marcar como pago"}
    </button>
  );
}
