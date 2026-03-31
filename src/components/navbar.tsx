"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Menu, X, Trophy, LogOut, User } from "lucide-react";

type NavbarProps = {
  userRole?: "participante" | "admin";
  userName?: string;
  pago?: boolean;
};

export function Navbar({ userRole, userName, pago }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + "/")
        ? "text-brand-green"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-brand-green" />
            <span className="text-lg font-bold text-gray-900">
              Bolão Copa<span className="text-brand-green"> 2026</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/classificacao" className={linkClass("/classificacao")}>
              Classificação
            </Link>
            <Link href="/regulamento" className={linkClass("/regulamento")}>
              Regulamento
            </Link>
            {userRole && (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>
                {pago ? (
                  <Link href="/apostas" className={linkClass("/apostas")}>
                    Apostas
                  </Link>
                ) : (
                  <Link href="/inscricao" className="btn-yellow py-1.5 text-xs">
                    Pagar Inscrição
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin" className={linkClass("/admin")}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {userRole ? (
              <>
                <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                  <User className="h-4 w-4" />
                  {userName ?? "Perfil"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link href="/entrar" className="btn-primary py-2">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/classificacao" className={linkClass("/classificacao")} onClick={() => setMenuOpen(false)}>
              Classificação
            </Link>
            <Link href="/regulamento" className={linkClass("/regulamento")} onClick={() => setMenuOpen(false)}>
              Regulamento
            </Link>
            {userRole && (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {pago ? (
                  <Link href="/apostas" className={linkClass("/apostas")} onClick={() => setMenuOpen(false)}>
                    Apostas
                  </Link>
                ) : (
                  <Link href="/inscricao" className="btn-yellow" onClick={() => setMenuOpen(false)}>
                    Pagar Inscrição — R$ 10,00
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin" className={linkClass("/admin")} onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <hr className="border-gray-200" />
                <Link href="/perfil" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                  Meu Perfil
                </Link>
                <button onClick={handleLogout} className="text-left text-sm text-red-600">
                  Sair
                </button>
              </>
            )}
            {!userRole && (
              <Link href="/entrar" className="btn-primary" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
