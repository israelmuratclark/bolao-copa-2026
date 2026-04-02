import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
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
    // Token-hash flow (default for signInWithOtp magic links)
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

  return NextResponse.redirect(new URL(next, req.url));
}
