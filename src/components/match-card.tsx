"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle, Lock } from "lucide-react";
import type { JogoComSelecoes, Aposta, StatusJogo } from "@/types";

type MatchCardProps = {
  jogo: JogoComSelecoes;
  aposta?: Pick<Aposta, "golsMandante" | "golsVisitante" | "pontosObtidos"> | null;
  pago: boolean;
};

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  disabled: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      value={value}
      onChange={(e) => {
        const v = e.target.value === "" ? "" : parseInt(e.target.value, 10);
        if (v === "" || (!isNaN(v as number) && (v as number) >= 0)) onChange(v);
      }}
      disabled={disabled}
      className="w-14 rounded-lg border border-gray-300 bg-white px-2 py-2 text-center text-lg font-bold focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      placeholder="0"
    />
  );
}

function FlagImage({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100 text-lg">
        🏳️
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={48}
      height={32}
      className="h-8 w-12 rounded object-cover shadow-sm"
    />
  );
}

export function MatchCard({ jogo, aposta, pago }: MatchCardProps) {
  const agora = new Date();
  const prazo = new Date(jogo.prazoApostas);
  const prazoPassado = agora >= prazo;
  const encerrado = jogo.status === ("encerrado" as StatusJogo);
  const aoVivo = jogo.status === ("ao_vivo" as StatusJogo);

  const [golsMandante, setGolsMandante] = useState<number | "">(
    aposta?.golsMandante ?? ""
  );
  const [golsVisitante, setGolsVisitante] = useState<number | "">(
    aposta?.golsVisitante ?? ""
  );
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(!!aposta);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const podeApostar = pago && !prazoPassado && !encerrado && !aoVivo;
  const temAposta = golsMandante !== "" && golsVisitante !== "";

  const nomeMandante = jogo.mandante?.nome ?? jogo.mandantePlaceholder ?? "A definir";
  const nomeVisitante = jogo.visitante?.nome ?? jogo.visitantePlaceholder ?? "A definir";

  const handleSalvar = async () => {
    if (!temAposta || !podeApostar) return;
    setSalvando(true);
    setErro(null);

    try {
      const res = await fetch("/api/apostas/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogoId: jogo.id,
          golsMandante: Number(golsMandante),
          golsVisitante: Number(golsVisitante),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErro(data.error ?? "Erro ao salvar aposta.");
      } else {
        setSalvo(true);
        startTransition(() => {});
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const pontosLabel = () => {
    if (!encerrado || aposta?.pontosObtidos == null) return null;
    const p = aposta.pontosObtidos;
    if (p === 10) return <span className="badge-green">+10 pts — Placar exato!</span>;
    if (p === 5) return <span className="badge-yellow">+5 pts — Vencedor correto</span>;
    if (p === 3) return <span className="badge-yellow">+3 pts — Empate correto</span>;
    return <span className="badge-gray">0 pts</span>;
  };

  return (
    <div className={`card p-4 transition-all ${aoVivo ? "ring-2 ring-brand-green" : ""}`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatInTimeZone(
            new Date(jogo.dataHoraUtc),
            "America/Sao_Paulo",
            "dd/MM HH:mm",
            { locale: ptBR }
          )}{" "}
          (BRT)
        </span>
        <div className="flex items-center gap-1.5">
          {aoVivo && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Ao vivo
            </span>
          )}
          {encerrado && <span className="badge-gray">Encerrado</span>}
          {!encerrado && !aoVivo && prazoPassado && (
            <span className="flex items-center gap-1 text-gray-400">
              <Lock className="h-3 w-3" /> Prazo encerrado
            </span>
          )}
          {!encerrado && !aoVivo && !prazoPassado && (
            <span className="flex items-center gap-1 text-green-600">
              <Clock className="h-3 w-3" />
              Apostas abertas
            </span>
          )}
        </div>
      </div>

      {/* Resultado oficial (se encerrado) */}
      {encerrado && jogo.golsMandante != null && jogo.golsVisitante != null && (
        <div className="mb-3 rounded-lg bg-gray-50 py-2 text-center text-2xl font-bold text-gray-900">
          {jogo.golsMandante} – {jogo.golsVisitante}
          {jogo.resultadoPenaltis && (
            <span className="ml-2 text-xs font-normal text-gray-500">(pen.)</span>
          )}
          {!jogo.resultadoPenaltis && jogo.resultadoProrrogacao && (
            <span className="ml-2 text-xs font-normal text-gray-500">(prorr.)</span>
          )}
        </div>
      )}

      {/* Times e inputs */}
      <div className="flex items-center gap-3">
        {/* Mandante */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <FlagImage
            url={jogo.mandante?.bandeirUrl ?? null}
            alt={nomeMandante}
          />
          <span className="text-center text-xs font-medium text-gray-700 leading-tight">
            {nomeMandante}
          </span>
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2">
          <ScoreInput
            value={golsMandante}
            onChange={setGolsMandante}
            disabled={!podeApostar}
          />
          <span className="text-lg font-bold text-gray-300">×</span>
          <ScoreInput
            value={golsVisitante}
            onChange={setGolsVisitante}
            disabled={!podeApostar}
          />
        </div>

        {/* Visitante */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <FlagImage
            url={jogo.visitante?.bandeirUrl ?? null}
            alt={nomeVisitante}
          />
          <span className="text-center text-xs font-medium text-gray-700 leading-tight">
            {nomeVisitante}
          </span>
        </div>
      </div>

      {/* Resultado da aposta */}
      <div className="mt-3 flex items-center justify-between">
        <div>{pontosLabel()}</div>
        {podeApostar && (
          <button
            onClick={handleSalvar}
            disabled={salvando || !temAposta}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              salvo && !salvando
                ? "bg-green-50 text-green-700"
                : "btn-primary py-1.5 text-xs"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {salvando ? (
              "Salvando..."
            ) : salvo ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" /> Salvo
              </>
            ) : (
              "Salvar aposta"
            )}
          </button>
        )}
        {!pago && !encerrado && (
          <a href="/inscricao" className="text-xs text-brand-green hover:underline">
            Pague para apostar →
          </a>
        )}
      </div>

      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}

      {/* Info do estádio */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {jogo.estadio}, {jogo.cidade}
      </p>
    </div>
  );
}
