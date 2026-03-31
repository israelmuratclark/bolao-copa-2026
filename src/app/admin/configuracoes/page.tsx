import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { AdminConfiguracoes } from "@/components/admin-configuracoes";
import { ChevronRight } from "lucide-react";

export default async function AdminConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entrar");

  const admin = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { nome: true, role: true, pago: true },
  });
  if (admin?.role !== "admin") redirect("/dashboard");

  const configs = await prisma.configuracao.findMany();
  const configMap = Object.fromEntries(configs.map((c) => [c.chave, c.valor]));

  return (
    <>
      <Navbar userRole="admin" userName={admin.nome} pago={admin.pago} />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">Admin</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Configurações</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Configurações do Bolão</h1>
        <AdminConfiguracoes configs={configMap} />
      </main>
    </>
  );
}
