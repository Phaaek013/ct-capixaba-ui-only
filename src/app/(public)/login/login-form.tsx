"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, PasswordInput, Checkbox, Button } from "@/components/ui";

export default function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      const map: Record<string, string> = {
        CredentialsSignin: "Credenciais inválidas",
        AccessDenied: "Acesso negado",
        Configuration: "Erro de configuração de autenticação",
      };
      setErro(map[err] ?? "Erro ao autenticar");
    }
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const senha = String(formData.get("senha") || "");

    const resposta = await signIn("credentials", {
      redirect: false,
      email,
      senha
    });

    setCarregando(false);

    if (resposta?.error) {
      setErro("Credenciais inválidas");
      return;
    }

    router.replace("/");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-200">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="text-sm font-medium text-zinc-200">
          Senha
        </label>
        <PasswordInput
          id="senha"
          name="senha"
          required
          autoComplete="current-password"
          placeholder="Digite sua senha"
        />
      </div>

      <label
        htmlFor="manter"
        className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer"
      >
        <Checkbox id="manter" name="manter" defaultChecked />
        <span>Manter conectado por 30 dias</span>
      </label>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <Button type="submit" disabled={carregando} className="w-full">
        {carregando ? "Entrando..." : "Entrar"}
      </Button>

      {/* Aviso de termos */}
      <p className="text-center text-xs text-zinc-500">
        Ao acessar o CT Capixaba você concorda com os{" "}
        <Link href="/termos" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
          Termos de uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
          Política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}
