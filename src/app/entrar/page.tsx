"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function EntrarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${next}`,
        data: modo === "cadastrar" ? { full_name: nome } : undefined,
      },
    });

    if (error) {
      setErro(error.message);
    } else {
      setEnviado(true);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${next}`,
      },
    });
  };

  if (enviado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-brand-green" />
          <h1 className="text-2xl font-bold text-gray-900">Verifique seu e-mail</h1>
          <p className="mt-3 text-gray-500">
            Enviamos um link de acesso para{" "}
            <strong className="text-gray-900">{email}</strong>. Clique no link para entrar.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Não encontrou? Verifique a pasta de spam.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="mt-6 text-sm text-brand-green hover:underline"
          >
            Usar outro e-mail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Trophy className="h-8 w-8 text-brand-green" />
            <span className="text-2xl font-bold text-gray-900">
              Bolão Copa<span className="text-brand-green"> 2026</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            {modo === "entrar" ? "Entre na sua conta" : "Crie sua conta e participe"}
          </p>
        </div>

        {/* Toggle entrar/cadastrar */}
        <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setModo("entrar")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              modo === "entrar"
                ? "bg-brand-green text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setModo("cadastrar")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              modo === "cadastrar"
                ? "bg-brand-green text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          {modo === "cadastrar" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Seu nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="input"
                placeholder="João Silva"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="seu@email.com"
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            <Mail className="h-4 w-4" />
            {loading
              ? "Enviando..."
              : modo === "entrar"
              ? "Enviar link de acesso"
              : "Criar conta com magic link"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <button
          onClick={handleGoogle}
          className="btn-secondary w-full justify-center py-3"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          Ao entrar, você concorda com as{" "}
          <Link href="/regulamento" className="text-brand-green hover:underline">
            regras do bolão
          </Link>
          .
        </p>

        <Link href="/" className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
