import { PrismaClient, FaseTorneio } from "@prisma/client";

const prisma = new PrismaClient();

// Copa do Mundo 2026 — 48 seleções classificadas (provisório, baseado em odds e ranking FIFA)
// Grupos A-L com 4 times cada
const selecoes = [
  // Grupo A
  { nome: "Estados Unidos", nomeEn: "United States", codigoFifa: "USA", bandeirUrl: "https://flagcdn.com/w80/us.png", grupo: "A" },
  { nome: "México", nomeEn: "Mexico", codigoFifa: "MEX", bandeirUrl: "https://flagcdn.com/w80/mx.png", grupo: "A" },
  { nome: "Canadá", nomeEn: "Canada", codigoFifa: "CAN", bandeirUrl: "https://flagcdn.com/w80/ca.png", grupo: "A" },
  { nome: "Panamá", nomeEn: "Panama", codigoFifa: "PAN", bandeirUrl: "https://flagcdn.com/w80/pa.png", grupo: "A" },
  // Grupo B
  { nome: "Argentina", nomeEn: "Argentina", codigoFifa: "ARG", bandeirUrl: "https://flagcdn.com/w80/ar.png", grupo: "B" },
  { nome: "Equador", nomeEn: "Ecuador", codigoFifa: "ECU", bandeirUrl: "https://flagcdn.com/w80/ec.png", grupo: "B" },
  { nome: "Uruguai", nomeEn: "Uruguay", codigoFifa: "URU", bandeirUrl: "https://flagcdn.com/w80/uy.png", grupo: "B" },
  { nome: "Chile", nomeEn: "Chile", codigoFifa: "CHI", bandeirUrl: "https://flagcdn.com/w80/cl.png", grupo: "B" },
  // Grupo C
  { nome: "Brasil", nomeEn: "Brazil", codigoFifa: "BRA", bandeirUrl: "https://flagcdn.com/w80/br.png", grupo: "C" },
  { nome: "Colômbia", nomeEn: "Colombia", codigoFifa: "COL", bandeirUrl: "https://flagcdn.com/w80/co.png", grupo: "C" },
  { nome: "Venezuela", nomeEn: "Venezuela", codigoFifa: "VEN", bandeirUrl: "https://flagcdn.com/w80/ve.png", grupo: "C" },
  { nome: "Bolívia", nomeEn: "Bolivia", codigoFifa: "BOL", bandeirUrl: "https://flagcdn.com/w80/bo.png", grupo: "C" },
  // Grupo D
  { nome: "França", nomeEn: "France", codigoFifa: "FRA", bandeirUrl: "https://flagcdn.com/w80/fr.png", grupo: "D" },
  { nome: "Bélgica", nomeEn: "Belgium", codigoFifa: "BEL", bandeirUrl: "https://flagcdn.com/w80/be.png", grupo: "D" },
  { nome: "Polônia", nomeEn: "Poland", codigoFifa: "POL", bandeirUrl: "https://flagcdn.com/w80/pl.png", grupo: "D" },
  { nome: "Romênia", nomeEn: "Romania", codigoFifa: "ROU", bandeirUrl: "https://flagcdn.com/w80/ro.png", grupo: "D" },
  // Grupo E
  { nome: "Espanha", nomeEn: "Spain", codigoFifa: "ESP", bandeirUrl: "https://flagcdn.com/w80/es.png", grupo: "E" },
  { nome: "Portugal", nomeEn: "Portugal", codigoFifa: "POR", bandeirUrl: "https://flagcdn.com/w80/pt.png", grupo: "E" },
  { nome: "Turquia", nomeEn: "Turkey", codigoFifa: "TUR", bandeirUrl: "https://flagcdn.com/w80/tr.png", grupo: "E" },
  { nome: "Geórgia", nomeEn: "Georgia", codigoFifa: "GEO", bandeirUrl: "https://flagcdn.com/w80/ge.png", grupo: "E" },
  // Grupo F
  { nome: "Alemanha", nomeEn: "Germany", codigoFifa: "GER", bandeirUrl: "https://flagcdn.com/w80/de.png", grupo: "F" },
  { nome: "Países Baixos", nomeEn: "Netherlands", codigoFifa: "NED", bandeirUrl: "https://flagcdn.com/w80/nl.png", grupo: "F" },
  { nome: "Áustria", nomeEn: "Austria", codigoFifa: "AUT", bandeirUrl: "https://flagcdn.com/w80/at.png", grupo: "F" },
  { nome: "Eslováquia", nomeEn: "Slovakia", codigoFifa: "SVK", bandeirUrl: "https://flagcdn.com/w80/sk.png", grupo: "F" },
  // Grupo G
  { nome: "Inglaterra", nomeEn: "England", codigoFifa: "ENG", bandeirUrl: "https://flagcdn.com/w80/gb-eng.png", grupo: "G" },
  { nome: "Croácia", nomeEn: "Croatia", codigoFifa: "CRO", bandeirUrl: "https://flagcdn.com/w80/hr.png", grupo: "G" },
  { nome: "Escócia", nomeEn: "Scotland", codigoFifa: "SCO", bandeirUrl: "https://flagcdn.com/w80/gb-sct.png", grupo: "G" },
  { nome: "Albânia", nomeEn: "Albania", codigoFifa: "ALB", bandeirUrl: "https://flagcdn.com/w80/al.png", grupo: "G" },
  // Grupo H
  { nome: "Marrocos", nomeEn: "Morocco", codigoFifa: "MAR", bandeirUrl: "https://flagcdn.com/w80/ma.png", grupo: "H" },
  { nome: "Senegal", nomeEn: "Senegal", codigoFifa: "SEN", bandeirUrl: "https://flagcdn.com/w80/sn.png", grupo: "H" },
  { nome: "Camarões", nomeEn: "Cameroon", codigoFifa: "CMR", bandeirUrl: "https://flagcdn.com/w80/cm.png", grupo: "H" },
  { nome: "Tunísia", nomeEn: "Tunisia", codigoFifa: "TUN", bandeirUrl: "https://flagcdn.com/w80/tn.png", grupo: "H" },
  // Grupo I
  { nome: "Japão", nomeEn: "Japan", codigoFifa: "JPN", bandeirUrl: "https://flagcdn.com/w80/jp.png", grupo: "I" },
  { nome: "Coreia do Sul", nomeEn: "South Korea", codigoFifa: "KOR", bandeirUrl: "https://flagcdn.com/w80/kr.png", grupo: "I" },
  { nome: "Austrália", nomeEn: "Australia", codigoFifa: "AUS", bandeirUrl: "https://flagcdn.com/w80/au.png", grupo: "I" },
  { nome: "Indonésia", nomeEn: "Indonesia", codigoFifa: "IDN", bandeirUrl: "https://flagcdn.com/w80/id.png", grupo: "I" },
  // Grupo J
  { nome: "Irã", nomeEn: "Iran", codigoFifa: "IRN", bandeirUrl: "https://flagcdn.com/w80/ir.png", grupo: "J" },
  { nome: "Uzbequistão", nomeEn: "Uzbekistan", codigoFifa: "UZB", bandeirUrl: "https://flagcdn.com/w80/uz.png", grupo: "J" },
  { nome: "Jordânia", nomeEn: "Jordan", codigoFifa: "JOR", bandeirUrl: "https://flagcdn.com/w80/jo.png", grupo: "J" },
  { nome: "Omã", nomeEn: "Oman", codigoFifa: "OMA", bandeirUrl: "https://flagcdn.com/w80/om.png", grupo: "J" },
  // Grupo K
  { nome: "México (2ª fase)", nomeEn: "Costa Rica", codigoFifa: "CRC", bandeirUrl: "https://flagcdn.com/w80/cr.png", grupo: "K" },
  { nome: "Honduras", nomeEn: "Honduras", codigoFifa: "HON", bandeirUrl: "https://flagcdn.com/w80/hn.png", grupo: "K" },
  { nome: "Jamaica", nomeEn: "Jamaica", codigoFifa: "JAM", bandeirUrl: "https://flagcdn.com/w80/jm.png", grupo: "K" },
  { nome: "Trinidad e Tobago", nomeEn: "Trinidad and Tobago", codigoFifa: "TRI", bandeirUrl: "https://flagcdn.com/w80/tt.png", grupo: "K" },
  // Grupo L
  { nome: "Nova Zelândia", nomeEn: "New Zealand", codigoFifa: "NZL", bandeirUrl: "https://flagcdn.com/w80/nz.png", grupo: "L" },
  { nome: "Arábia Saudita", nomeEn: "Saudi Arabia", codigoFifa: "KSA", bandeirUrl: "https://flagcdn.com/w80/sa.png", grupo: "L" },
  { nome: "Emirados Árabes", nomeEn: "UAE", codigoFifa: "UAE", bandeirUrl: "https://flagcdn.com/w80/ae.png", grupo: "L" },
  { nome: "Kuwait", nomeEn: "Kuwait", codigoFifa: "KUW", bandeirUrl: "https://flagcdn.com/w80/kw.png", grupo: "L" },
];

const configuracoes = [
  { chave: "taxa_inscricao_centavos", valor: "1000", descricao: "Valor da inscrição em centavos (R$ 10,00)" },
  { chave: "distribuicao_primeiro", valor: "50", descricao: "Percentual do prêmio para 1º lugar" },
  { chave: "distribuicao_segundo", valor: "30", descricao: "Percentual do prêmio para 2º lugar" },
  { chave: "distribuicao_terceiro", valor: "20", descricao: "Percentual do prêmio para 3º lugar" },
  { chave: "taxa_plataforma", valor: "0", descricao: "Percentual retido pela plataforma (0 = sem taxa)" },
  { chave: "inscricoes_abertas", valor: "true", descricao: "Se novas inscrições estão sendo aceitas" },
  { chave: "apostas_abertas", valor: "true", descricao: "Se novas apostas estão sendo aceitas" },
  { chave: "pontos_placar_exato", valor: "10", descricao: "Pontos por placar exato" },
  { chave: "pontos_vencedor_correto", valor: "5", descricao: "Pontos por acertar o vencedor (placar errado)" },
  { chave: "pontos_empate_correto", valor: "3", descricao: "Pontos por acertar empate (placar errado)" },
];

// Função auxiliar para criar data/hora UTC
function dt(dateStr: string): Date {
  return new Date(dateStr);
}

// Prazo de apostas = 30min antes do jogo
function prazo(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() - 30);
  return d;
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Seed configurações
  console.log("⚙️  Inserindo configurações...");
  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor, descricao: config.descricao },
      create: config,
    });
  }

  // 2. Seed seleções
  console.log("🏳️  Inserindo seleções...");
  const selecoesCriadas: Record<string, number> = {};
  for (const s of selecoes) {
    const created = await prisma.selecao.upsert({
      where: { codigoFifa: s.codigoFifa },
      update: { nome: s.nome, nomeEn: s.nomeEn, bandeirUrl: s.bandeirUrl, grupo: s.grupo },
      create: s,
    });
    selecoesCriadas[s.codigoFifa] = created.id;
  }

  // 3. Seed jogos da fase de grupos
  // Copa 2026: 12 grupos × 6 jogos = 72 jogos na fase de grupos
  // Cada grupo (4 times) tem 6 jogos (todos contra todos)
  console.log("⚽ Inserindo jogos da fase de grupos...");

  const grupos: Record<string, string[]> = {};
  for (const s of selecoes) {
    if (s.grupo) {
      if (!grupos[s.grupo]) grupos[s.grupo] = [];
      grupos[s.grupo].push(s.codigoFifa);
    }
  }

  // Estádios da Copa 2026 (EUA, Canadá e México)
  const estadios = [
    { estadio: "MetLife Stadium", cidade: "Nova York/Nova Jersey" },
    { estadio: "AT&T Stadium", cidade: "Dallas" },
    { estadio: "SoFi Stadium", cidade: "Los Angeles" },
    { estadio: "Levi's Stadium", cidade: "San Francisco" },
    { estadio: "Hard Rock Stadium", cidade: "Miami" },
    { estadio: "Arrowhead Stadium", cidade: "Kansas City" },
    { estadio: "Lincoln Financial Field", cidade: "Filadélfia" },
    { estadio: "Gillette Stadium", cidade: "Boston" },
    { estadio: "Q2 Stadium", cidade: "Austin" },
    { estadio: "BC Place", cidade: "Vancouver" },
    { estadio: "BMO Field", cidade: "Toronto" },
    { estadio: "Estádio Azteca", cidade: "Cidade do México" },
    { estadio: "Estádio Akron", cidade: "Guadalajara" },
    { estadio: "Estádio BBVA", cidade: "Monterrey" },
    { estadio: "NRG Stadium", cidade: "Houston" },
    { estadio: "Mercedes-Benz Stadium", cidade: "Atlanta" },
    { estadio: "Allegiant Stadium", cidade: "Las Vegas" },
    { estadio: "CenturyLink Field", cidade: "Seattle" },
  ];

  let jogoNumero = 1;
  const jogosDatas: Record<number, string> = {};

  // Fase de grupos: jogos 1-72
  // Datas baseadas no calendário provisório da FIFA (junho-julho 2026)
  const datasBase = [
    "2026-06-11T18:00:00Z", "2026-06-11T21:00:00Z",
    "2026-06-12T18:00:00Z", "2026-06-12T21:00:00Z",
    "2026-06-13T18:00:00Z", "2026-06-13T21:00:00Z",
    "2026-06-14T18:00:00Z", "2026-06-14T21:00:00Z",
    "2026-06-15T18:00:00Z", "2026-06-15T21:00:00Z",
    "2026-06-16T18:00:00Z", "2026-06-16T21:00:00Z",
    "2026-06-17T18:00:00Z", "2026-06-17T21:00:00Z",
    "2026-06-18T18:00:00Z", "2026-06-18T21:00:00Z",
    "2026-06-19T18:00:00Z", "2026-06-19T21:00:00Z",
    "2026-06-20T18:00:00Z", "2026-06-20T21:00:00Z",
    "2026-06-21T18:00:00Z", "2026-06-21T21:00:00Z",
    "2026-06-22T18:00:00Z", "2026-06-22T21:00:00Z",
    "2026-06-23T18:00:00Z", "2026-06-23T21:00:00Z",
    "2026-06-24T18:00:00Z", "2026-06-24T21:00:00Z",
    "2026-06-25T18:00:00Z", "2026-06-25T21:00:00Z",
    "2026-06-26T18:00:00Z", "2026-06-26T21:00:00Z",
    "2026-06-27T18:00:00Z", "2026-06-27T21:00:00Z",
    "2026-06-28T18:00:00Z", "2026-06-28T21:00:00Z",
  ];

  const grupoKeys = Object.keys(grupos).sort();
  let dataIdx = 0;

  for (const grupoKey of grupoKeys) {
    const times = grupos[grupoKey];
    // Rodada 1: time[0]×time[1], time[2]×time[3]
    // Rodada 2: time[0]×time[2], time[1]×time[3]
    // Rodada 3: time[0]×time[3], time[1]×time[2]
    const jogosGrupo = [
      { r: 1, m: times[0], v: times[1] },
      { r: 1, m: times[2], v: times[3] },
      { r: 2, m: times[0], v: times[2] },
      { r: 2, m: times[1], v: times[3] },
      { r: 3, m: times[0], v: times[3] },
      { r: 3, m: times[1], v: times[2] },
    ];

    for (const j of jogosGrupo) {
      const dataHora = datasBase[dataIdx % datasBase.length];
      dataIdx++;
      const est = estadios[jogoNumero % estadios.length];

      await prisma.jogo.upsert({
        where: { numeroJogo: jogoNumero },
        update: {},
        create: {
          fase: FaseTorneio.fase_grupos,
          numeroJogo: jogoNumero,
          mandanteId: selecoesCriadas[j.m],
          visitanteId: selecoesCriadas[j.v],
          estadio: est.estadio,
          cidade: est.cidade,
          dataHoraUtc: dt(dataHora),
          prazoApostas: prazo(dataHora),
          grupo: grupoKey,
          rodadaGrupo: j.r,
        },
      });
      jogoNumero++;
    }
  }

  // Jogos do mata-mata (73-104): times ainda não definidos (placeholder)
  console.log("🏆 Inserindo jogos do mata-mata...");

  // Rodada de 32 (jogo 73-88): 16 jogos
  const datasMataM = [
    "2026-07-01T21:00:00Z", "2026-07-02T18:00:00Z", "2026-07-02T21:00:00Z",
    "2026-07-03T18:00:00Z", "2026-07-03T21:00:00Z", "2026-07-04T18:00:00Z",
    "2026-07-04T21:00:00Z", "2026-07-05T18:00:00Z", "2026-07-05T21:00:00Z",
    "2026-07-06T18:00:00Z", "2026-07-06T21:00:00Z", "2026-07-07T18:00:00Z",
    "2026-07-07T21:00:00Z", "2026-07-08T18:00:00Z", "2026-07-08T21:00:00Z",
    "2026-07-09T21:00:00Z",
  ];

  for (let i = 0; i < 16; i++) {
    const num = 73 + i;
    const dataHora = datasMataM[i];
    const est = estadios[num % estadios.length];
    await prisma.jogo.upsert({
      where: { numeroJogo: num },
      update: {},
      create: {
        fase: FaseTorneio.rodada_32,
        numeroJogo: num,
        mandantePlaceholder: `Classificado R32-M${i + 1}`,
        visitantePlaceholder: `Classificado R32-V${i + 1}`,
        estadio: est.estadio,
        cidade: est.cidade,
        dataHoraUtc: dt(dataHora),
        prazoApostas: prazo(dataHora),
      },
    });
  }

  // Oitavas (89-96): 8 jogos
  const datasOitavas = [
    "2026-07-11T18:00:00Z", "2026-07-11T21:00:00Z",
    "2026-07-12T18:00:00Z", "2026-07-12T21:00:00Z",
    "2026-07-13T18:00:00Z", "2026-07-13T21:00:00Z",
    "2026-07-14T18:00:00Z", "2026-07-14T21:00:00Z",
  ];
  for (let i = 0; i < 8; i++) {
    const num = 89 + i;
    const est = estadios[num % estadios.length];
    await prisma.jogo.upsert({
      where: { numeroJogo: num },
      update: {},
      create: {
        fase: FaseTorneio.oitavas_de_final,
        numeroJogo: num,
        mandantePlaceholder: `Vencedor R32 Jogo ${72 + (i * 2 + 1)}`,
        visitantePlaceholder: `Vencedor R32 Jogo ${72 + (i * 2 + 2)}`,
        estadio: est.estadio,
        cidade: est.cidade,
        dataHoraUtc: dt(datasOitavas[i]),
        prazoApostas: prazo(datasOitavas[i]),
      },
    });
  }

  // Quartas (97-100): 4 jogos
  const datasQuartas = [
    "2026-07-17T18:00:00Z", "2026-07-17T21:00:00Z",
    "2026-07-18T18:00:00Z", "2026-07-18T21:00:00Z",
  ];
  for (let i = 0; i < 4; i++) {
    const num = 97 + i;
    const est = estadios[num % estadios.length];
    await prisma.jogo.upsert({
      where: { numeroJogo: num },
      update: {},
      create: {
        fase: FaseTorneio.quartas_de_final,
        numeroJogo: num,
        mandantePlaceholder: `Vencedor Oitavas Jogo ${88 + (i * 2 + 1)}`,
        visitantePlaceholder: `Vencedor Oitavas Jogo ${88 + (i * 2 + 2)}`,
        estadio: est.estadio,
        cidade: est.cidade,
        dataHoraUtc: dt(datasQuartas[i]),
        prazoApostas: prazo(datasQuartas[i]),
      },
    });
  }

  // Semifinais (101-102): 2 jogos
  for (let i = 0; i < 2; i++) {
    const num = 101 + i;
    const data = i === 0 ? "2026-07-21T21:00:00Z" : "2026-07-22T21:00:00Z";
    const est = estadios[num % estadios.length];
    await prisma.jogo.upsert({
      where: { numeroJogo: num },
      update: {},
      create: {
        fase: FaseTorneio.semifinal,
        numeroJogo: num,
        mandantePlaceholder: `Vencedor Quartas Jogo ${96 + (i * 2 + 1)}`,
        visitantePlaceholder: `Vencedor Quartas Jogo ${96 + (i * 2 + 2)}`,
        estadio: "MetLife Stadium",
        cidade: "Nova York/Nova Jersey",
        dataHoraUtc: dt(data),
        prazoApostas: prazo(data),
      },
    });
  }

  // 3º lugar (103)
  await prisma.jogo.upsert({
    where: { numeroJogo: 103 },
    update: {},
    create: {
      fase: FaseTorneio.terceiro_lugar,
      numeroJogo: 103,
      mandantePlaceholder: "Perdedor Semifinal 1",
      visitantePlaceholder: "Perdedor Semifinal 2",
      estadio: "MetLife Stadium",
      cidade: "Nova York/Nova Jersey",
      dataHoraUtc: dt("2026-07-25T18:00:00Z"),
      prazoApostas: prazo("2026-07-25T18:00:00Z"),
    },
  });

  // Final (104)
  await prisma.jogo.upsert({
    where: { numeroJogo: 104 },
    update: {},
    create: {
      fase: FaseTorneio.final,
      numeroJogo: 104,
      mandantePlaceholder: "Vencedor Semifinal 1",
      visitantePlaceholder: "Vencedor Semifinal 2",
      estadio: "MetLife Stadium",
      cidade: "Nova York/Nova Jersey",
      dataHoraUtc: dt("2026-07-26T21:00:00Z"),
      prazoApostas: prazo("2026-07-26T21:00:00Z"),
    },
  });

  const totalJogos = await prisma.jogo.count();
  const totalSelecoes = await prisma.selecao.count();
  const totalConfigs = await prisma.configuracao.count();

  console.log(`✅ Seed concluído!`);
  console.log(`   - ${totalSelecoes} seleções`);
  console.log(`   - ${totalJogos} jogos`);
  console.log(`   - ${totalConfigs} configurações`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
