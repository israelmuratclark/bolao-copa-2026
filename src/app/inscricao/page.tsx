"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Copy, Clock, RefreshCw } from "lucide-react";

type PagamentoData = {
  pagamentoId: string;
  qrCode: string | null;
  qrCodeUrl: string | null;
  expiraEm: string;
};

function Countdown({ expiraEm }: { expiraEm: string }) {
  const [segundos, setSegundos] = useState(() => {
    const diff = new Date(expiraEm).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (segundos <= 0) return;
    const timer = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [segundos]);

  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  const expired = segundos === 0;

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${expired ? "text-red-600" : "text-gray-600"}`}>
      <Clock className="h-4 w-4" />
      {expired
        ? "PIX expirado — gere um novo"
        : `Expira em ${min}:${String(sec).padStart(2, "0")}`}
    </div>
  );
}

export default function InscricaoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [usuario, setUsuario] = useState<{ nome: string; pago: boolean } | null>(null);
  const [pagamento, setPagamento] = useState<PagamentoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);

  // Carregar usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/entrar");
        return;
      }
      fetch("/api/usuario/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.pago) router.push("/apostas");
          else setUsuario(data);
        });
    });
  }, []);

  // Polling de confirmação de pagamento
  useEffect(() => {
    if (!pagamento) return;

    const interval = setInterval(async () => {
      setVerificandoPagamento(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/usuario/me");
      const data = await res.json();
      if (data.pago) {
        clearInterval(interval);
        router.push("/apostas?pagamento=confirmado");
      }
      setVerificandoPagamento(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [pagamento]);

  const gerarPix = async () => {
    setLoading(true);
    setErro(null);
    const res = await fetch("/api/pagamentos/criar", { method: "POST" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      setErro(data.error ?? "Erro ao gerar PIX.");
    } else {
      setPagamento(data.data);
    }
    setLoading(false);
  };

  const copiarCodigo = () => {
    if (!pagamento?.qrCode) return;
    navigator.clipboard.writeText(pagamento.qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
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
      <Navbar userRole="participante" userName={usuario.nome} pago={false} />
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900">Pagar Inscrição</h1>
          <p className="mt-1 text-sm text-gray-500">
            Confirme sua participação pagando R$ 10,00 via PIX.
          </p>

          {!pagamento ? (
            <>
              <div className="my-6 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inscrição — Bolão Copa 2026</span>
                  <span className="text-lg font-bold text-gray-900">R$ 10,00</span>
                </div>
              </div>

              {erro && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
              )}

              <button
                onClick={gerarPix}
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Gerando PIX...
                  </span>
                ) : (
                  "Gerar QR Code PIX"
                )}
              </button>
            </>
          ) : (
            <div className="mt-4 space-y-4">
              {/* QR Code */}
              {pagamento.qrCodeUrl && (
                <div className="flex flex-col items-center">
                  <Image
                    src={pagamento.qrCodeUrl}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-200"
                    unoptimized
                  />
                </div>
              )}

              {/* Copia e Cola */}
              {pagamento.qrCode && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700">
                    Ou copie o código PIX:
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={pagamento.qrCode}
                      className="input flex-1 truncate text-xs"
                    />
                    <button
                      onClick={copiarCodigo}
                      className="btn-secondary flex items-center gap-1.5 px-3"
                    >
                      {copiado ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiado ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <Countdown expiraEm={pagamento.expiraEm} />
                {verificandoPagamento && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Verificando...
                  </span>
                )}
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Como pagar:</strong> Abra o app do seu banco, vá em PIX → Ler QR Code
                  (ou &ldquo;Copia e Cola&rdquo;), e faça o pagamento. A confirmação é automática.
                </p>
              </div>

              <button
                onClick={gerarPix}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="mr-1 inline h-3.5 w-3.5" />
                Gerar novo QR Code
              </button>
            </div>
          )}

          <Link href="/dashboard" className="mt-6 block text-center text-sm text-gray-400 hover:text-gray-600">
            Voltar ao painel
          </Link>
        </div>
      </main>
    </>
  );
}
