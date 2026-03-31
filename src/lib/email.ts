import { Resend } from "resend";
import { formatarReais } from "./prize";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Bolão Copa 2026 <bolao@seudominio.com.br>";

export async function enviarEmailConfirmacaoPagamento(
  email: string,
  nome: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Inscrição confirmada! Bem-vindo ao Bolão Copa 2026 ⚽",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009C3B; padding: 24px; text-align: center;">
          <h1 style="color: #FFDF00; margin: 0;">Bolão Copa 2026</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2>Olá, ${nome}!</h2>
          <p>Sua inscrição no <strong>Bolão Copa 2026</strong> foi confirmada com sucesso!</p>
          <p>Agora você pode acessar o site e registrar seus palpites para todos os 104 jogos.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/apostas"
               style="background: #009C3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Fazer Apostas →
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Dúvidas? Consulte o <a href="${process.env.NEXT_PUBLIC_APP_URL}/regulamento">regulamento</a>.
          </p>
        </div>
      </div>
    `,
  });
}

export async function enviarEmailResultadoJogo(
  email: string,
  nome: string,
  params: {
    mandante: string;
    visitante: string;
    golsMandante: number;
    golsVisitante: number;
    golsApostadosMandante: number;
    golsApostadosVisitante: number;
    pontosObtidos: number;
    totalPontos: number;
  }
) {
  const { mandante, visitante, golsMandante, golsVisitante,
    golsApostadosMandante, golsApostadosVisitante, pontosObtidos, totalPontos } = params;

  const tipoAcerto =
    pontosObtidos === 10 ? "Placar exato! 🎯" :
    pontosObtidos === 5 ? "Vencedor correto! 👍" :
    pontosObtidos === 3 ? "Empate correto! 🤝" :
    "Resultado errado 😔";

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Resultado: ${mandante} ${golsMandante}×${golsVisitante} ${visitante}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009C3B; padding: 24px; text-align: center;">
          <h1 style="color: #FFDF00; margin: 0;">Resultado do Jogo</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2>${mandante} ${golsMandante}×${golsVisitante} ${visitante}</h2>
          <p>Seu palpite: <strong>${golsApostadosMandante}×${golsApostadosVisitante}</strong></p>
          <p>${tipoAcerto} <strong style="color: #009C3B;">+${pontosObtidos} pts</strong></p>
          <p>Total acumulado: <strong>${totalPontos} pts</strong></p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/classificacao"
               style="background: #009C3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ver Classificação →
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function enviarEmailPremio(
  email: string,
  nome: string,
  posicao: number,
  valorCentavos: number
) {
  const medais = ["🥇", "🥈", "🥉"];
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Parabéns! Você ficou em ${posicao}º lugar no Bolão Copa 2026! ${medais[posicao - 1]}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #009C3B; padding: 24px; text-align: center;">
          <h1 style="color: #FFDF00; margin: 0;">🏆 Parabéns!</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <div style="font-size: 64px;">${medais[posicao - 1]}</div>
          <h2>${nome}, você ficou em ${posicao}º lugar!</h2>
          <p>Seu prêmio é de <strong style="font-size: 24px; color: #009C3B;">${formatarReais(valorCentavos)}</strong></p>
          <p>O valor será transferido via PIX para a chave cadastrada no seu perfil.</p>
          <p style="color: #666; font-size: 14px;">
            Certifique-se de ter sua chave PIX atualizada em
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/perfil">Meu Perfil</a>.
          </p>
        </div>
      </div>
    `,
  });
}
