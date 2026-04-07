import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MercadoPagoConfig, { Payment } from "mercadopago";

export const maxDuration = 30;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ success: false, error: "Não autenticado." }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { id: true, pago: true, email: true, nome: true },
  });

  if (!usuario) {
    return NextResponse.json({ success: false, error: "Usuário não encontrado." }, { status: 404 });
  }

  if (usuario.pago) {
    return NextResponse.json(
      { success: false, error: "Inscrição já paga." },
      { status: 400 }
    );
  }

  // Verificar se já há pagamento pendente válido
  const pagamentoPendente = await prisma.pagamento.findFirst({
    where: {
      usuarioId: usuario.id,
      status: "pendente",
      expiraEm: { gt: new Date() },
    },
    orderBy: { criadoEm: "desc" },
  });

  if (pagamentoPendente?.provedorQrCode) {
    return NextResponse.json({
      success: true,
      data: {
        pagamentoId: pagamentoPendente.id,
        qrCode: pagamentoPendente.provedorQrCode,
        qrCodeUrl: pagamentoPendente.provedorQrCodeUrl,
        expiraEm: pagamentoPendente.expiraEm,
      },
    });
  }

  // Criar novo pagamento PIX no Mercado Pago
  const payment = new Payment(client);

  const expiraEm = new Date();
  expiraEm.setMinutes(expiraEm.getMinutes() + 30);

  const mpResponse = await payment.create({
    body: {
      transaction_amount: 10.0,
      description: "Bolão Copa do Mundo 2026 — Inscrição",
      payment_method_id: "pix",
      payer: {
        email: usuario.email,
        first_name: usuario.nome.split(" ")[0],
        last_name: usuario.nome.split(" ").slice(1).join(" ") || "-",
      },
      date_of_expiration: expiraEm.toISOString(),
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      metadata: {
        usuario_id: usuario.id,
        bolao: "copa2026",
      },
    },
  });

  const qrCode =
    mpResponse.point_of_interaction?.transaction_data?.qr_code ?? null;
  const qrCodeBase64 =
    mpResponse.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;

  // Salvar no banco
  const pagamento = await prisma.pagamento.create({
    data: {
      usuarioId: usuario.id,
      tipo: "inscricao",
      valorCentavos: 1000,
      status: "pendente",
      provedor: "mercadopago",
      provedorPaymentId: String(mpResponse.id),
      provedorQrCode: qrCode,
      provedorQrCodeUrl: qrCodeBase64
        ? `data:image/png;base64,${qrCodeBase64}`
        : null,
      provedorResponse: mpResponse as object,
      expiraEm,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      pagamentoId: pagamento.id,
      qrCode,
      qrCodeUrl: pagamento.provedorQrCodeUrl,
      expiraEm,
    },
  });
  } catch (e) {
    console.error("[pagamentos/criar] erro:", JSON.stringify(e, Object.getOwnPropertyNames(e as object)));
    const msg = (e && typeof e === "object" && "message" in e)
      ? String((e as {message: unknown}).message)
      : JSON.stringify(e, Object.getOwnPropertyNames(e as object));
    return NextResponse.json({ success: false, error: msg.slice(0, 300) }, { status: 500 });
  }
}
