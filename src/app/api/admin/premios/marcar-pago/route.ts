import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { role: true },
  });

  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { usuarioId, posicao, valorCentavos, totalPontos } = await req.json();

  await prisma.premio.upsert({
    where: {
      // Unique constraint: um registro por posição
      id: (await prisma.premio.findFirst({ where: { posicao } }))?.id ?? 0,
    },
    update: {
      pago: true,
      pagoEm: new Date(),
    },
    create: {
      usuarioId,
      posicao,
      valorCentavos,
      totalPontos,
      pago: true,
      pagoEm: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
