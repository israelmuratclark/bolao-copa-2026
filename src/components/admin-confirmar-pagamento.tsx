"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminConfirmarPagamento({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!confirm("Confirmar pagamento manual deste usuário?")) return;
    setLoading(true);

    await fetch("/api/admin/confirmar-pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId }),
    });

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleConfirmar}
      disabled={loading}
      className="text-xs text-brand-green hover:underline disabled:opacity-50"
    >
      {loading ? "..." : "Confirmar manualmente"}
    </button>
  );
}
