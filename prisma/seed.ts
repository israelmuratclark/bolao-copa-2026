import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* ignore if file doesn't exist */ }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const selecoes = [
  // Grupo A
  { nome: "Estados Unidos", nome_en: "United States", codigo_fifa: "USA", bandeira_url: "https://flagcdn.com/w80/us.png", grupo: "A" },
  { nome: "México", nome_en: "Mexico", codigo_fifa: "MEX", bandeira_url: "https://flagcdn.com/w80/mx.png", grupo: "A" },
  { nome: "Canadá", nome_en: "Canada", codigo_fifa: "CAN", bandeira_url: "https://flagcdn.com/w80/ca.png", grupo: "A" },
  { nome: "Panamá", nome_en: "Panama", codigo_fifa: "PAN", bandeira_url: "https://flagcdn.com/w80/pa.png", grupo: "A" },
  // Grupo B
  { nome: "Argentina", nome_en: "Argentina", codigo_fifa: "ARG", bandeira_url: "https://flagcdn.com/w80/ar.png", grupo: "B" },
  { nome: "Equador", nome_en: "Ecuador", codigo_fifa: "ECU", bandeira_url: "https://flagcdn.com/w80/ec.png", grupo: "B" },
  { nome: "Uruguai", nome_en: "Uruguay", codigo_fifa: "URU", bandeira_url: "https://flagcdn.com/w80/uy.png", grupo: "B" },
  { nome: "Chile", nome_en: "Chile", codigo_fifa: "CHI", bandeira_url: "https://flagcdn.com/w80/cl.png", grupo: "B" },
  // Grupo C
  { nome: "Brasil", nome_en: "Brazil", codigo_fifa: "BRA", bandeira_url: "https://flagcdn.com/w80/br.png", grupo: "C" },
  { nome: "Colômbia", nome_en: "Colombia", codigo_fifa: "COL", bandeira_url: "https://flagcdn.com/w80/co.png", grupo: "C" },
  { nome: "Venezuela", nome_en: "Venezuela", codigo_fifa: "VEN", bandeira_url: "https://flagcdn.com/w80/ve.png", grupo: "C" },
  { nome: "Bolívia", nome_en: "Bolivia", codigo_fifa: "BOL", bandeira_url: "https://flagcdn.com/w80/bo.png", grupo: "C" },
  // Grupo D
  { nome: "França", nome_en: "France", codigo_fifa: "FRA", bandeira_url: "https://flagcdn.com/w80/fr.png", grupo: "D" },
  { nome: "Bélgica", nome_en: "Belgium", codigo_fifa: "BEL", bandeira_url: "https://flagcdn.com/w80/be.png", grupo: "D" },
  { nome: "Polônia", nome_en: "Poland", codigo_fifa: "POL", bandeira_url: "https://flagcdn.com/w80/pl.png", grupo: "D" },
  { nome: "Romênia", nome_en: "Romania", codigo_fifa: "ROU", bandeira_url: "https://flagcdn.com/w80/ro.png", grupo: "D" },
  // Grupo E
  { nome: "Espanha", nome_en: "Spain", codigo_fifa: "ESP", bandeira_url: "https://flagcdn.com/w80/es.png", grupo: "E" },
  { nome: "Portugal", nome_en: "Portugal", codigo_fifa: "POR", bandeira_url: "https://flagcdn.com/w80/pt.png", grupo: "E" },
  { nome: "Turquia", nome_en: "Turkey", codigo_fifa: "TUR", bandeira_url: "https://flagcdn.com/w80/tr.png", grupo: "E" },
  { nome: "Geórgia", nome_en: "Georgia", codigo_fifa: "GEO", bandeira_url: "https://flagcdn.com/w80/ge.png", grupo: "E" },
  // Grupo F
  { nome: "Alemanha", nome_en: "Germany", codigo_fifa: "GER", bandeira_url: "https://flagcdn.com/w80/de.png", grupo: "F" },
  { nome: "Países Baixos", nome_en: "Netherlands", codigo_fifa: "NED", bandeira_url: "https://flagcdn.com/w80/nl.png", grupo: "F" },
  { nome: "Áustria", nome_en: "Austria", codigo_fifa: "AUT", bandeira_url: "https://flagcdn.com/w80/at.png", grupo: "F" },
  { nome: "Eslováquia", nome_en: "Slovakia", codigo_fifa: "SVK", bandeira_url: "https://flagcdn.com/w80/sk.png", grupo: "F" },
  // Grupo G
  { nome: "Inglaterra", nome_en: "England", codigo_fifa: "ENG", bandeira_url: "https://flagcdn.com/w80/gb-eng.png", grupo: "G" },
  { nome: "Croácia", nome_en: "Croatia", codigo_fifa: "CRO", bandeira_url: "https://flagcdn.com/w80/hr.png", grupo: "G" },
  { nome: "Escócia", nome_en: "Scotland", codigo_fifa: "SCO", bandeira_url: "https://flagcdn.com/w80/gb-sct.png", grupo: "G" },
  { nome: "Albânia", nome_en: "Albania", codigo_fifa: "ALB", bandeira_url: "https://flagcdn.com/w80/al.png", grupo: "G" },
  // Grupo H
  { nome: "Marrocos", nome_en: "Morocco", codigo_fifa: "MAR", bandeira_url: "https://flagcdn.com/w80/ma.png", grupo: "H" },
  { nome: "Senegal", nome_en: "Senegal", codigo_fifa: "SEN", bandeira_url: "https://flagcdn.com/w80/sn.png", grupo: "H" },
  { nome: "Camarões", nome_en: "Cameroon", codigo_fifa: "CMR", bandeira_url: "https://flagcdn.com/w80/cm.png", grupo: "H" },
  { nome: "Tunísia", nome_en: "Tunisia", codigo_fifa: "TUN", bandeira_url: "https://flagcdn.com/w80/tn.png", grupo: "H" },
  // Grupo I
  { nome: "Japão", nome_en: "Japan", codigo_fifa: "JPN", bandeira_url: "https://flagcdn.com/w80/jp.png", grupo: "I" },
  { nome: "Coreia do Sul", nome_en: "South Korea", codigo_fifa: "KOR", bandeira_url: "https://flagcdn.com/w80/kr.png", grupo: "I" },
  { nome: "Austrália", nome_en: "Australia", codigo_fifa: "AUS", bandeira_url: "https://flagcdn.com/w80/au.png", grupo: "I" },
  { nome: "Indonésia", nome_en: "Indonesia", codigo_fifa: "IDN", bandeira_url: "https://flagcdn.com/w80/id.png", grupo: "I" },
  // Grupo J
  { nome: "Irã", nome_en: "Iran", codigo_fifa: "IRN", bandeira_url: "https://flagcdn.com/w80/ir.png", grupo: "J" },
  { nome: "Uzbequistão", nome_en: "Uzbekistan", codigo_fifa: "UZB", bandeira_url: "https://flagcdn.com/w80/uz.png", grupo: "J" },
  { nome: "Jordânia", nome_en: "Jordan", codigo_fifa: "JOR", bandeira_url: "https://flagcdn.com/w80/jo.png", grupo: "J" },
  { nome: "Omã", nome_en: "Oman", codigo_fifa: "OMA", bandeira_url: "https://flagcdn.com/w80/om.png", grupo: "J" },
  // Grupo K
  { nome: "Costa Rica", nome_en: "Costa Rica", codigo_fifa: "CRC", bandeira_url: "https://flagcdn.com/w80/cr.png", grupo: "K" },
  { nome: "Honduras", nome_en: "Honduras", codigo_fifa: "HON", bandeira_url: "https://flagcdn.com/w80/hn.png", grupo: "K" },
  { nome: "Jamaica", nome_en: "Jamaica", codigo_fifa: "JAM", bandeira_url: "https://flagcdn.com/w80/jm.png", grupo: "K" },
  { nome: "Trinidad e Tobago", nome_en: "Trinidad and Tobago", codigo_fifa: "TRI", bandeira_url: "https://flagcdn.com/w80/tt.png", grupo: "K" },
  // Grupo L
  { nome: "Nova Zelândia", nome_en: "New Zealand", codigo_fifa: "NZL", bandeira_url: "https://flagcdn.com/w80/nz.png", grupo: "L" },
  { nome: "Arábia Saudita", nome_en: "Saudi Arabia", codigo_fifa: "KSA", bandeira_url: "https://flagcdn.com/w80/sa.png", grupo: "L" },
  { nome: "Emirados Árabes", nome_en: "UAE", codigo_fifa: "UAE", bandeira_url: "https://flagcdn.com/w80/ae.png", grupo: "L" },
  { nome: "Kuwait", nome_en: "Kuwait", codigo_fifa: "KUW", bandeira_url: "https://flagcdn.com/w80/kw.png", grupo: "L" },
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

function prazo(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() - 30);
  return d.toISOString();
}

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

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Configurações
  console.log("⚙️  Inserindo configurações...");
  for (const cfg of configuracoes) {
    const { error } = await supabase
      .from("configuracoes")
      .upsert(cfg, { onConflict: "chave" });
    if (error) throw error;
  }

  // 2. Seleções
  console.log("🏳️  Inserindo seleções...");
  const selecoesCriadas: Record<string, number> = {};
  for (const s of selecoes) {
    const { data, error } = await supabase
      .from("selecoes")
      .upsert(s, { onConflict: "codigo_fifa" })
      .select("id, codigo_fifa")
      .single();
    if (error) throw error;
    selecoesCriadas[data.codigo_fifa] = data.id;
  }

  // 3. Fase de grupos (72 jogos)
  console.log("⚽ Inserindo jogos da fase de grupos...");
  const grupos: Record<string, string[]> = {};
  for (const s of selecoes) {
    if (s.grupo) {
      if (!grupos[s.grupo]) grupos[s.grupo] = [];
      grupos[s.grupo].push(s.codigo_fifa);
    }
  }

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

  let jogoNumero = 1;
  let dataIdx = 0;
  const grupoKeys = Object.keys(grupos).sort();

  for (const grupoKey of grupoKeys) {
    const times = grupos[grupoKey];
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

      const { error } = await supabase.from("jogos").upsert(
        {
          fase: "fase_grupos",
          numero_jogo: jogoNumero,
          mandante_id: selecoesCriadas[j.m],
          visitante_id: selecoesCriadas[j.v],
          estadio: est.estadio,
          cidade: est.cidade,
          data_hora_utc: dataHora,
          prazo_apostas: prazo(dataHora),
          grupo: grupoKey,
          rodada_grupo: j.r,
        },
        { onConflict: "numero_jogo" }
      );
      if (error) throw error;
      jogoNumero++;
    }
  }

  // 4. Rodada de 32 (jogos 73-88)
  console.log("🏆 Inserindo jogos do mata-mata...");
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
    const est = estadios[num % estadios.length];
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "rodada_32",
        numero_jogo: num,
        mandante_placeholder: `Classificado R32-M${i + 1}`,
        visitante_placeholder: `Classificado R32-V${i + 1}`,
        estadio: est.estadio,
        cidade: est.cidade,
        data_hora_utc: datasMataM[i],
        prazo_apostas: prazo(datasMataM[i]),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  // 5. Oitavas (89-96)
  const datasOitavas = [
    "2026-07-11T18:00:00Z", "2026-07-11T21:00:00Z",
    "2026-07-12T18:00:00Z", "2026-07-12T21:00:00Z",
    "2026-07-13T18:00:00Z", "2026-07-13T21:00:00Z",
    "2026-07-14T18:00:00Z", "2026-07-14T21:00:00Z",
  ];
  for (let i = 0; i < 8; i++) {
    const num = 89 + i;
    const est = estadios[num % estadios.length];
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "oitavas_de_final",
        numero_jogo: num,
        mandante_placeholder: `Vencedor R32 Jogo ${72 + (i * 2 + 1)}`,
        visitante_placeholder: `Vencedor R32 Jogo ${72 + (i * 2 + 2)}`,
        estadio: est.estadio,
        cidade: est.cidade,
        data_hora_utc: datasOitavas[i],
        prazo_apostas: prazo(datasOitavas[i]),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  // 6. Quartas (97-100)
  const datasQuartas = [
    "2026-07-17T18:00:00Z", "2026-07-17T21:00:00Z",
    "2026-07-18T18:00:00Z", "2026-07-18T21:00:00Z",
  ];
  for (let i = 0; i < 4; i++) {
    const num = 97 + i;
    const est = estadios[num % estadios.length];
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "quartas_de_final",
        numero_jogo: num,
        mandante_placeholder: `Vencedor Oitavas Jogo ${88 + (i * 2 + 1)}`,
        visitante_placeholder: `Vencedor Oitavas Jogo ${88 + (i * 2 + 2)}`,
        estadio: est.estadio,
        cidade: est.cidade,
        data_hora_utc: datasQuartas[i],
        prazo_apostas: prazo(datasQuartas[i]),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  // 7. Semifinais (101-102)
  for (let i = 0; i < 2; i++) {
    const num = 101 + i;
    const dataHora = i === 0 ? "2026-07-21T21:00:00Z" : "2026-07-22T21:00:00Z";
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "semifinal",
        numero_jogo: num,
        mandante_placeholder: `Vencedor Quartas Jogo ${96 + (i * 2 + 1)}`,
        visitante_placeholder: `Vencedor Quartas Jogo ${96 + (i * 2 + 2)}`,
        estadio: "MetLife Stadium",
        cidade: "Nova York/Nova Jersey",
        data_hora_utc: dataHora,
        prazo_apostas: prazo(dataHora),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  // 8. 3º lugar (103)
  {
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "terceiro_lugar",
        numero_jogo: 103,
        mandante_placeholder: "Perdedor Semifinal 1",
        visitante_placeholder: "Perdedor Semifinal 2",
        estadio: "MetLife Stadium",
        cidade: "Nova York/Nova Jersey",
        data_hora_utc: "2026-07-25T18:00:00Z",
        prazo_apostas: prazo("2026-07-25T18:00:00Z"),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  // 9. Final (104)
  {
    const { error } = await supabase.from("jogos").upsert(
      {
        fase: "final",
        numero_jogo: 104,
        mandante_placeholder: "Vencedor Semifinal 1",
        visitante_placeholder: "Vencedor Semifinal 2",
        estadio: "MetLife Stadium",
        cidade: "Nova York/Nova Jersey",
        data_hora_utc: "2026-07-26T21:00:00Z",
        prazo_apostas: prazo("2026-07-26T21:00:00Z"),
      },
      { onConflict: "numero_jogo" }
    );
    if (error) throw error;
  }

  const { count: totalJogos } = await supabase.from("jogos").select("*", { count: "exact", head: true });
  const { count: totalSelecoes } = await supabase.from("selecoes").select("*", { count: "exact", head: true });
  const { count: totalConfigs } = await supabase.from("configuracoes").select("*", { count: "exact", head: true });

  console.log("✅ Seed concluído!");
  console.log(`   - ${totalSelecoes} seleções`);
  console.log(`   - ${totalJogos} jogos`);
  console.log(`   - ${totalConfigs} configurações`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
