import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import MercadoPagoConfig, { Payment } from "mercadopago";
import crypto from "crypto";

export const maxDuration = 30;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function validarAssinatura(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // Em desenvolvimento sem secret configurado

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") ?? "";

  // Formato: ts=<timestamp>,v1=<hash>
  const parts = xSignature.split(",");
  let ts = "";
  let v1 = "";
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "ts") ts = v;
    if (k === "v1") v1 = v;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v1));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!validarAssinatura(req, rawBody)) {
    console.warn("[webhook] Assinatura inválida");
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: { type?: string; data?: { id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Apenas processar notificações de pagamento
  if (payload.type !== "payment" || !payload.data?.id) {
    return NextResponse.json({ received: true });
  }

  const mpPaymentId = String(payload.data.id);

  // Buscar pagamento no banco
  const pagamento = await prisma.pagamento.findFirst({
    where: { provedorPaymentId: mpPaymentId },
    include: { usuario: true },
  });

  if (!pagamento) {
    // Pode ser um pagamento antigo ou de outro sistema — ignorar silenciosamente
    return NextResponse.json({ received: true });
  }

  if (pagamento.status === "aprovado") {
    // Idempotência: já processado
    return NextResponse.json({ received: true });
  }

  // Verificar status real no MP (nunca confiar apenas no webhook body)
  const mpPayment = new Payment(client);
  const mpDetails = await mpPayment.get({ id: mpPaymentId });

  const mpStatus = mpDetails.status;

  if (mpStatus === "approved") {
    // Processar aprovação em transação
    await prisma.$transaction([
      prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: "aprovado",
          provedorResponse: mpDetails as object,
          webhookRecebidoEm: new Date(),
        },
      }),
      prisma.usuario.update({
        where: { id: pagamento.usuarioId },
        data: { pago: true },
      }),
      // Criar row de pontuação se não existir
      prisma.pontuacao.upsert({
        where: { usuarioId: pagamento.usuarioId },
        update: {},
        create: {
          usuarioId: pagamento.usuarioId,
          totalPontos: 0,
          acertosExatos: 0,
          acertosParciais: 0,
          jogosApostados: 0,
        },
      }),
    ]);

    console.log(`[webhook] Pagamento aprovado: usuário ${pagamento.usuarioId}`);
  } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status: "rejeitado",
        provedorResponse: mpDetails as object,
        webhookRecebidoEm: new Date(),
      },
    });
  }

  return NextResponse.json({ received: true });
}
