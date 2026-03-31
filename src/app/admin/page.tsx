import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { formatarReais, calcularPremios } from "@/lib/prize";
import { Users, Trophy, Settings, Gamepad2 } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/entrar");

  const usuario = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { nome: true, role: true, pago: true },
  });

  if (usuario?.role !== "admin") redirect("/dashboard");

  const [totalUsuarios, totalPagos, totalJogos, jogosEncerrados] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { pago: true } }),
    prisma.jogo.count(),
    prisma.jogo.count({ where: { status: "encerrado" } }),
  ]);

  const premios = calcularPremios(totalPagos);

  const cards = [
    { icon: Users, label: "Usuários", value: totalUsuarios, sub: `${totalPagos} pagantes`, href: "/admin/usuarios" },
    { icon: Gamepad2, label: "Jogos", value: totalJogos, sub: `${jogosEncerrados} encerrados`, href: "/admin/jogos" },
    { icon: Trophy, label: "Prêmio Total", value: formatarReais(premios.premioLiquidoCentavos), sub: `${totalPagos} × R$ 10,00`, href: "/admin/premios" },
    { icon: Settings, label: "Configurações", value: "—", sub: "pontos, distribuição", href: "/admin/configuracoes" },
  ];

  return (
    <>
      <Navbar userRole="admin" userName={usuario.nome} pago={usuario.pago} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Painel Admin</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="card p-5 transition-shadow hover:shadow-md"
            >
              <card.icon className="mb-3 h-6 w-6 text-brand-green" />
              <div className="text-sm text-gray-500">{card.label}</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-400">{card.sub}</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">1º lugar (50%)</div>
            <div className="text-xl font-bold text-brand-green">{formatarReais(premios.primeiro)}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">2º lugar (30%)</div>
            <div className="text-xl font-bold text-gray-700">{formatarReais(premios.segundo)}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs text-gray-500">3º lugar (20%)</div>
            <div className="text-xl font-bold text-gray-700">{formatarReais(premios.terceiro)}</div>
          </div>
        </div>
      </main>
    </>
  );
}
