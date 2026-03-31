import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { ChevronRight, CheckCircle, Clock } from "lucide-react";
import { AdminConfirmarPagamento } from "@/components/admin-confirmar-pagamento";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entrar");

  const admin = await prisma.usuario.findUnique({
    where: { authId: session.user.id },
    select: { nome: true, role: true, pago: true },
  });
  if (admin?.role !== "admin") redirect("/dashboard");

  const usuarios = await prisma.usuario.findMany({
    include: { pontuacao: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <>
      <Navbar userRole="admin" userName={admin.nome} pago={admin.pago} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">Admin</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Usuários</span>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Usuários ({usuarios.length})
          </h1>
          <span className="badge-green">
            {usuarios.filter((u) => u.pago).length} pagantes
          </span>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Nome</th>
                  <th className="px-4 py-3 text-left text-gray-600 hidden md:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-center text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">Pontos</th>
                  <th className="px-4 py-3 text-right text-gray-600">Ação</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      {u.pago ? (
                        <span className="flex items-center justify-center gap-1 text-green-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Pago</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-yellow-700">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">Pendente</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 hidden sm:table-cell">
                      {u.pontuacao?.totalPontos ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!u.pago && <AdminConfirmarPagamento usuarioId={u.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
