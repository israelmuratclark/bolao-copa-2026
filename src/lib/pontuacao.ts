/**
 * Sistema de pontuação do Bolão Copa 2026
 *
 * - Placar exato:          10 pts
 * - Vencedor correto:       5 pts
 * - Empate correto:         3 pts
 * - Resultado errado:       0 pts
 */

export type ResultadoJogo = {
  golsMandante: number;
  golsVisitante: number;
};

export type TipoAcerto = "exato" | "vencedor" | "empate" | "errado";

export function calcularPontos(
  aposta: ResultadoJogo,
  resultado: ResultadoJogo,
  pontosConfig?: {
    exato?: number;
    vencedor?: number;
    empate?: number;
  }
): { pontos: number; tipo: TipoAcerto } {
  const pts = {
    exato: pontosConfig?.exato ?? 10,
    vencedor: pontosConfig?.vencedor ?? 5,
    empate: pontosConfig?.empate ?? 3,
  };

  const { golsMandante: am, golsVisitante: av } = aposta;
  const { golsMandante: rm, golsVisitante: rv } = resultado;

  // Placar exato
  if (am === rm && av === rv) {
    return { pontos: pts.exato, tipo: "exato" };
  }

  const apostouEmpate = am === av;
  const resultouEmpate = rm === rv;

  // Empate correto (apostou empate e resultou empate, mas placares diferentes)
  if (apostouEmpate && resultouEmpate) {
    return { pontos: pts.empate, tipo: "empate" };
  }

  // Vencedor correto
  const apostouMandante = am > av;
  const resultouMandante = rm > rv;
  const apostouVisitante = am < av;
  const resultouVisitante = rm < rv;

  if (
    (apostouMandante && resultouMandante) ||
    (apostouVisitante && resultouVisitante)
  ) {
    return { pontos: pts.vencedor, tipo: "vencedor" };
  }

  return { pontos: 0, tipo: "errado" };
}

/**
 * Desempate para classificação:
 * 1. Mais pontos totais
 * 2. Mais acertos exatos
 * 3. Mais acertos parciais (vencedor/empate correto)
 * 4. Mais jogos apostados
 * 5. Cadastro mais antigo (desempate final determinístico)
 */
export type EntradaClassificacao = {
  usuarioId: string;
  nome: string;
  totalPontos: number;
  acertosExatos: number;
  acertosParciais: number;
  jogosApostados: number;
  criadoEm: Date;
};

export function ordenarClassificacao(
  entradas: EntradaClassificacao[]
): EntradaClassificacao[] {
  return [...entradas].sort((a, b) => {
    if (b.totalPontos !== a.totalPontos) return b.totalPontos - a.totalPontos;
    if (b.acertosExatos !== a.acertosExatos) return b.acertosExatos - a.acertosExatos;
    if (b.acertosParciais !== a.acertosParciais) return b.acertosParciais - a.acertosParciais;
    if (b.jogosApostados !== a.jogosApostados) return b.jogosApostados - a.jogosApostados;
    return a.criadoEm.getTime() - b.criadoEm.getTime();
  });
}
