import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Cria o response de redirect ANTES, para que o Supabase client
  // escreva os cookies de sessão diretamente nele (não em um cookie store separado).
  const response = NextResponse.redirect(new URL(next, req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Escreve os cookies de autenticação diretamente no response de redirect
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let session = null;

  if (code) {
    // PKCE flow (OAuth / some magic link configs)
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    session = data.session;
  } else if (token_hash && type) {
    // Token-hash flow (default para signInWithOtp magic links)
    const { data } = await supabase.auth.verifyOtp({ token_hash, type });
    session = data.session;
  }

  if (session) {
    const user = session.user;
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
  }

  return response;
}
