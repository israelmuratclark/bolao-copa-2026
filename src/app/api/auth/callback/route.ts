import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("[AUTH CALLBACK] params:", { code: !!code, token_hash: !!token_hash, type, next });

  // Criar response de redirect ANTES — cookies vão direto nele
  const successResponse = NextResponse.redirect(new URL(next, origin));
  const errorResponse = (msg: string) => {
    console.error("[AUTH CALLBACK] Redirecionando para erro:", msg);
    return NextResponse.redirect(new URL(`/entrar?erro=${encodeURIComponent(msg)}`, origin));
  };

  if (!code && !(token_hash && type)) {
    return errorResponse("link_invalido");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            successResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let session = null;

  if (code) {
    console.log("[AUTH CALLBACK] Tentando exchangeCodeForSession...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[AUTH CALLBACK] exchangeCodeForSession erro:", error.message, error.status);
      return errorResponse("code_invalido");
    }
    session = data.session;
    console.log("[AUTH CALLBACK] exchangeCodeForSession OK, session:", !!session);
  } else if (token_hash && type) {
    console.log("[AUTH CALLBACK] Tentando verifyOtp, type:", type);
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("[AUTH CALLBACK] verifyOtp erro:", error.message, error.status, error.code);
      return errorResponse("token_invalido");
    }
    session = data.session;
    console.log("[AUTH CALLBACK] verifyOtp OK, session:", !!session);
  }

  if (!session) {
    console.error("[AUTH CALLBACK] Session null após verificação.");
    return errorResponse("sessao_nula");
  }

  const user = session.user;
  console.log("[AUTH CALLBACK] Upserting usuario:", user.email);

  try {
    await prisma.usuario.upsert({
      where: { authId: user.id },
      update: {},
      create: {
        authId: user.id,
        email: user.email!,
        nome:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Participante",
        role: "participante",
        pago: false,
      },
    });
  } catch (e) {
    console.error("[AUTH CALLBACK] Prisma upsert erro:", e);
    return errorResponse("db_error");
  }

  console.log("[AUTH CALLBACK] Sucesso! Redirecionando para:", next);
  return successResponse;
}
