import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    include: { pontuacao: true },
  });

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json(usuario);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const { nome, telefone, chavePix } = body;

  const usuario = await prisma.usuario.update({
    where: { authId: session.user.id },
    data: {
      ...(nome && { nome }),
      ...(telefone !== undefined && { telefone }),
      ...(chavePix !== undefined && { chavePix }),
    },
    select: { id: true, nome: true, email: true, telefone: true, chavePix: true },
  });

  return NextResponse.json(usuario);
}
