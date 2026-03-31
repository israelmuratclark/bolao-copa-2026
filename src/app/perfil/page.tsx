"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { CheckCircle, Save } from "lucide-react";

type UsuarioData = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  chavePix: string | null;
  role: "participante" | "admin";
  pago: boolean;
};

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/entrar");
        return;
      }
      fetch("/api/usuario/me")
        .then((r) => r.json())
        .then((data: UsuarioData) => {
          setUsuario(data);
          setNome(data.nome);
          setTelefone(data.telefone ?? "");
          setChavePix(data.chavePix ?? "");
        });
    });
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSalvo(false);

    const res = await fetch("/api/usuario/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone: telefone || null, chavePix: chavePix || null }),
    });

    if (res.ok) {
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } else {
      const data = await res.json();
      setErro(data.error ?? "Erro ao salvar.");
    }
    setSalvando(false);
  };

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Navbar userRole={usuario.role} userName={usuario.nome} pago={usuario.pago} />
      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu Perfil</h1>

        <div className="card p-6">
          <form onSubmit={handleSalvar} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={usuario.email}
                disabled
                className="input bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">E-mail não pode ser alterado.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="input"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Chave PIX para receber prêmio
              </label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                className="input"
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
              <p className="mt-1 text-xs text-gray-400">
                Se você for premiado, o pagamento será enviado para esta chave PIX.
              </p>
            </div>

            {erro && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="btn-primary w-full justify-center py-3"
            >
              {salvando ? (
                "Salvando..."
              ) : salvo ? (
                <><CheckCircle className="h-4 w-4" /> Salvo com sucesso!</>
              ) : (
                <><Save className="h-4 w-4" /> Salvar alterações</>
              )}
            </button>
          </form>
        </div>

        {/* Status */}
        <div className="mt-4 card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Status da Participação</h2>
          <div className="flex items-center gap-2">
            {usuario.pago ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Inscrição confirmada</span>
              </>
            ) : (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-yellow-400" />
                <span className="text-sm text-yellow-700 font-medium">Pagamento pendente</span>
                <a href="/inscricao" className="ml-auto text-sm text-brand-green hover:underline">
                  Pagar agora →
                </a>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
