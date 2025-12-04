"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button, Input, Label, PasswordInput, Checkbox, Alert } from "@/components/ui";

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
    <form onSubmit={onSubmit} className="space-y-5">
      {erro && (
        <Alert variant="error">
          {erro}
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <Label htmlFor="senha">Senha</Label>
        <PasswordInput
          id="senha"
          name="senha"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <div>
        <Checkbox
          id="manter"
          name="manter"
          defaultChecked
          label="Manter conectado por 30 dias"
        />
      </div>

      <Button
        type="submit"
        isLoading={carregando}
        className="w-full"
      >
        Entrar
      </Button>
    </form>
  );
}
