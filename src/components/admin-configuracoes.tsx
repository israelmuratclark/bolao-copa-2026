"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle } from "lucide-react";

type Props = {
  configs: Record<string, string>;
};

export function AdminConfiguracoes({ configs }: Props) {
  const router = useRouter();
  const [values, setValues] = useState({
    pontos_placar_exato: configs.pontos_placar_exato ?? "10",
    pontos_vencedor_correto: configs.pontos_vencedor_correto ?? "5",
    pontos_empate_correto: configs.pontos_empate_correto ?? "3",
    distribuicao_primeiro: configs.distribuicao_primeiro ?? "50",
    distribuicao_segundo: configs.distribuicao_segundo ?? "30",
    distribuicao_terceiro: configs.distribuicao_terceiro ?? "20",
    taxa_plataforma: configs.taxa_plataforma ?? "0",
    inscricoes_abertas: configs.inscricoes_abertas ?? "true",
    apostas_abertas: configs.apostas_abertas ?? "true",
  });

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const totalDist =
    Number(values.distribuicao_primeiro) +
    Number(values.distribuicao_segundo) +
    Number(values.distribuicao_terceiro);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDist !== 100) {
      alert("A soma das distribuições deve ser 100%.");
      return;
    }
    setSalvando(true);

    await fetch("/api/admin/configuracoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSalvo(true);
    setSalvando(false);
    setTimeout(() => setSalvo(false), 3000);
    router.refresh();
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      {/* Pontuação */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Sistema de Pontuação</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: "pontos_placar_exato", label: "Placar exato" },
            { key: "pontos_vencedor_correto", label: "Vencedor correto" },
            { key: "pontos_empate_correto", label: "Empate correto" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={values[key as keyof typeof values]}
                  onChange={(e) => set(key, e.target.value)}
                  className="input text-center"
                />
                <span className="text-sm text-gray-500">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuição de prêmios */}
      <div className="card p-5">
        <h2 className="mb-1 font-semibold text-gray-900">Distribuição de Prêmios</h2>
        <p className={`mb-4 text-sm ${totalDist !== 100 ? "text-red-600" : "text-gray-500"}`}>
          Total: {totalDist}% {totalDist !== 100 && "(deve ser 100%)"}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: "distribuicao_primeiro", label: "1º lugar" },
            { key: "distribuicao_segundo", label: "2º lugar" },
            { key: "distribuicao_terceiro", label: "3º lugar" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={values[key as keyof typeof values]}
                  onChange={(e) => set(key, e.target.value)}
                  className="input text-center"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de acesso */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Controles</h2>
        <div className="space-y-3">
          {[
            { key: "inscricoes_abertas", label: "Inscrições abertas" },
            { key: "apostas_abertas", label: "Apostas abertas" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values[key as keyof typeof values] === "true"}
                onChange={(e) => set(key, e.target.checked ? "true" : "false")}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={salvando || totalDist !== 100}
        className="btn-primary w-full justify-center py-3"
      >
        {salvo ? (
          <><CheckCircle className="h-4 w-4" /> Salvo!</>
        ) : (
          <><Save className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar configurações"}</>
        )}
      </button>
    </form>
  );
}
