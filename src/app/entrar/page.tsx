"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, Mail, ArrowLeft, CheckCircle } from "lucide-react";

function EntrarForm() {
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

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <EntrarForm />
    </Suspense>
  );
}
