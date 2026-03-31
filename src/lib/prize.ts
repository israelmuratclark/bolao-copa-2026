/**
 * Cálculo automático de prêmios
 *
 * Distribuição padrão:
 * - 1º lugar: 50%
 * - 2º lugar: 30%
 * - 3º lugar: 20%
 *
 * Todos os valores em centavos (int) para evitar erros de ponto flutuante.
 */

export type DistribuicaoPremio = {
  primeiro: number; // percentual (0-100)
  segundo: number;
  terceiro: number;
  taxaPlataforma: number;
};

export type PremioCalculado = {
  totalArrecadadoCentavos: number;
  taxaPlataformaCentavos: number;
  premioLiquidoCentavos: number;
  primeiro: number;
  segundo: number;
  terceiro: number;
};

export function calcularPremios(
  totalParticipantes: number,
  taxaInscricaoCentavos = 1000,
  distribuicao: DistribuicaoPremio = {
    primeiro: 50,
    segundo: 30,
    terceiro: 20,
    taxaPlataforma: 0,
  }
): PremioCalculado {
  const totalArrecadadoCentavos = totalParticipantes * taxaInscricaoCentavos;
  const taxaPlataformaCentavos = Math.floor(
    (totalArrecadadoCentavos * distribuicao.taxaPlataforma) / 100
  );
  const premioLiquidoCentavos = totalArrecadadoCentavos - taxaPlataformaCentavos;

  // Arredondamento para baixo; sobra vai para o 1º lugar
  const segundo = Math.floor(
    (premioLiquidoCentavos * distribuicao.segundo) / 100
  );
  const terceiro = Math.floor(
    (premioLiquidoCentavos * distribuicao.terceiro) / 100
  );
  const primeiro = premioLiquidoCentavos - segundo - terceiro;

  return {
    totalArrecadadoCentavos,
    taxaPlataformaCentavos,
    premioLiquidoCentavos,
    primeiro,
    segundo,
    terceiro,
  };
}

/** Formata centavos para string BRL, ex: 10050 → "R$ 100,50" */
export function formatarReais(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}
