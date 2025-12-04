// src/app/(public)/login/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import LoginForm from "./login-form";

// Garante que o Next não tente pré-renderizar isso estaticamente
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Só usamos o banco pra saber se precisa mostrar o link de setup do primeiro coach
  const totalCoaches = await prisma.usuario.count({
    where: { tipo: TipoUsuario.Coach },
  });

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + título */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative h-14 w-40">
            <Image
              src="/uploads/logoct.png"
              alt="CT Capixaba"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Acessar CT Capixaba
          </h1>
          <p className="text-sm text-slate-400">
            Entre com seu e-mail e senha para acessar seus treinos.
          </p>
        </div>

        {/* Card de login */}
        <div className="rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl backdrop-blur-md">
          <LoginForm />
        </div>

        {/* Setup do primeiro coach */}
        {totalCoaches === 0 && (
          <p className="text-center text-xs text-slate-400">
            Nenhum coach cadastrado ainda.{" "}
            <Link
              href="/setup"
              className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
            >
              Configurar primeiro coach
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
