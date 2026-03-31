import type {
  Usuario,
  Selecao,
  Jogo,
  Aposta,
  Pontuacao,
  Pagamento,
  Premio,
  Configuracao,
  FaseTorneio,
  StatusJogo,
  StatusPagamento,
  RoleUsuario,
} from "@prisma/client";

export type {
  Usuario,
  Selecao,
  Jogo,
  Aposta,
  Pontuacao,
  Pagamento,
  Premio,
  Configuracao,
  FaseTorneio,
  StatusJogo,
  StatusPagamento,
  RoleUsuario,
};

export type JogoComSelecoes = Jogo & {
  mandante: Selecao | null;
  visitante: Selecao | null;
};

export type JogoComApostas = JogoComSelecoes & {
  apostas: Aposta[];
};

export type EntradaClassificacao = {
  posicao: number;
  usuario: Usuario;
  pontuacao: Pontuacao;
};

export type PremioDisplay = {
  posicao: number;
  percentual: number;
  valorCentavos: number;
};

export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const FASES_LABEL: Record<FaseTorneio, string> = {
  fase_grupos: "Fase de Grupos",
  rodada_32: "Rodada de 32",
  oitavas_de_final: "Oitavas de Final",
  quartas_de_final: "Quartas de Final",
  semifinal: "Semifinal",
  terceiro_lugar: "Disputa de 3º Lugar",
  final: "Final",
};

export const FASES_ORDEM: FaseTorneio[] = [
  "fase_grupos",
  "rodada_32",
  "oitavas_de_final",
  "quartas_de_final",
  "semifinal",
  "terceiro_lugar",
  "final",
];
