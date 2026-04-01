import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROTAS_PROTEGIDAS = ["/dashboard", "/apostas", "/inscricao", "/perfil"];
const ROTAS_ADMIN = ["/admin"];

export async function proxy(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const rotaProtegida = ROTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));
  const rotaAdmin = ROTAS_ADMIN.some((r) => pathname.startsWith(r));

  if ((rotaProtegida || rotaAdmin) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Autorização de admin é verificada em cada página/rota via DB (tabela usuarios.role)
  // O middleware apenas garante que o usuário esteja autenticado.

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
};
