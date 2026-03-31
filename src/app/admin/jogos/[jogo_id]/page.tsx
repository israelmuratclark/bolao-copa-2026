"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Save, AlertTriangle } from "lucide-react";

type JogoDetalhe = {
  id: number;
  numeroJogo: number;
  fase: string;
  status: string;
  estadio: string;
  cidade: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  resultadoProrrogacao: boolean;
  resultadoPenaltis: boolean;
  mandante?: { nome: string } | null;
  visitante?: { nome: string } | null;
  mandantePlaceholder?: string | null;
  visitantePlaceholder?: string | null;
};

export default function AdminJogoEditarPage() {
  const params = useParams();
  const router = useRouter();
  const jogoId = Number(params.jogo_id);

  const [jogo, setJogo] = useState<JogoDetalhe | null>(null);
  const [golsM, setGolsM] = useState<number | "">(0);
  const [golsV, setGolsV] = useState<number | "">(0);
  const [prorrogacao, setProrrogacao] = useState(false);
  const [penaltis, setPenaltis] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/jogos/${jogoId}`)
      .then((r) => r.json())
      .then((data) => {
        setJogo(data);
        if (data.golsMandante != null) {
          setGolsM(data.golsMandante);
          setGolsV(data.golsVisitante);
          setProrrogacao(data.resultadoProrrogacao);
          setPenaltis(data.resultadoPenaltis);
        }
      });
  }, [jogoId]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (golsM === "" || golsV === "") return;
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    const res = await fetch("/api/admin/resultados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jogoId,
        golsMandante: Number(golsM),
        golsVisitante: Number(golsV),
        resultadoProrrogacao: prorrogacao,
        resultadoPenaltis: penaltis,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setErro(data.error ?? "Erro ao salvar resultado.");
    } else {
      setSucesso(true);
      setTimeout(() => router.push("/admin/jogos"), 1500);
    }
    setSalvando(false);
  };

  if (!jogo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      </div>
    );
  }

  const nomeMandante = jogo.mandante?.nome ?? jogo.mandantePlaceholder ?? "?";
  const nomeVisitante = jogo.visitante?.nome ?? jogo.visitantePlaceholder ?? "?";

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">Admin</Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href="/admin/jogos" className="text-gray-500 hover:text-gray-700">Jogos</Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="font-medium">Jogo #{jogo.numeroJogo}</span>
      </div>

      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold text-gray-900">
          {nomeMandante} × {nomeVisitante}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {jogo.estadio}, {jogo.cidade}
        </p>

        {jogo.status === "encerrado" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Jogo já encerrado. Ao salvar, os pontos serão recalculados.
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Resultado final</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{nomeMandante}</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={golsM}
                  onChange={(e) => setGolsM(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="input text-center text-2xl font-bold"
                />
              </div>
              <span className="text-2xl text-gray-300 mt-5">×</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{nomeVisitante}</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={golsV}
                  onChange={(e) => setGolsV(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="input text-center text-2xl font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prorrogacao}
                onChange={(e) => setProrrogacao(e.target.checked)}
                className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              Houve prorrogação
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={penaltis}
                onChange={(e) => {
                  setPenaltis(e.target.checked);
                  if (e.target.checked) setProrrogacao(true);
                }}
                className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              Definido nos pênaltis
            </label>
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          {sucesso && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Resultado salvo! Pontuações recalculadas. Redirecionando...
            </div>
          )}

          <button
            type="submit"
            disabled={salvando || golsM === "" || golsV === ""}
            className="btn-primary w-full justify-center py-3"
          >
            <Save className="h-4 w-4" />
            {salvando ? "Salvando e calculando pontos..." : "Salvar resultado"}
          </button>
        </form>
      </div>
    </main>
  );
}
