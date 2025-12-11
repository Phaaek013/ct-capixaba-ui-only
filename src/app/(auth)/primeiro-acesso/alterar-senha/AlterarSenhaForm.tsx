"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

// PasswordField FORA do componente para evitar remount a cada render
function PasswordField({
  label,
  value,
  onChange,
  shown,
  toggleShown,
  name,
  autoComplete,
  minLength
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  shown: boolean;
  toggleShown: () => void;
  name: string;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={shown ? "text" : "password"}
          className="w-full rounded-xl bg-[#0B0B0B] border border-zinc-700/70 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500/70"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          onClick={toggleShown}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-y-0 right-3 flex items-center
                     bg-transparent hover:bg-transparent
                     text-zinc-400 hover:text-zinc-100
                     focus:outline-none focus:ring-0"
        >
          {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

type AlterarSenhaFormProps = {
  erroQuery: string | null;
  alterarSenhaAction: (formData: FormData) => Promise<void>;
};

export default function AlterarSenhaForm({ erroQuery, alterarSenhaAction }: AlterarSenhaFormProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostraSenhaAtual, setMostraSenhaAtual] = useState(false);
  const [mostraNovaSenha, setMostraNovaSenha] = useState(false);
  const [mostraConfirmar, setMostraConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha.length < MIN_PASSWORD_LENGTH) {
      setErro(`A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("senhaAtual", senhaAtual);
      formData.append("novaSenha", novaSenha);
      formData.append("confirmar", confirmarSenha);

      await alterarSenhaAction(formData);
      setMensagem("Senha alterada com sucesso. Você já pode acessar o sistema.");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => setMensagem(null), 4000);
    } catch (error: any) {
      if (error?.digest === "NEXT_REDIRECT") {
        throw error;
      }
      setErro(error?.message || "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50">
      <header className="max-w-md mx-auto px-4 pt-10 pb-6">
        <h1 className="text-2xl font-semibold">Alterar senha</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Defina uma nova senha para continuar usando o CT Capixaba.
        </p>
      </header>

      <main className="max-w-md mx-auto px-4 pb-10">
        <form
          onSubmit={handleSubmit}
          className="bg-[#111111] border border-zinc-800/60 rounded-2xl p-5 space-y-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        >
          <PasswordField
            label="Senha atual"
            value={senhaAtual}
            onChange={setSenhaAtual}
            shown={mostraSenhaAtual}
            toggleShown={() => setMostraSenhaAtual((prev) => !prev)}
            name="senhaAtual"
            autoComplete="current-password"
          />

          <PasswordField
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            shown={mostraNovaSenha}
            toggleShown={() => setMostraNovaSenha((prev) => !prev)}
            name="novaSenha"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />

          <PasswordField
            label="Confirmar nova senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            shown={mostraConfirmar}
            toggleShown={() => setMostraConfirmar((prev) => !prev)}
            name="confirmar"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />

          {erroQuery === "invalid" && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
              As senhas precisam corresponder e ter pelo menos {MIN_PASSWORD_LENGTH} caracteres.
            </p>
          )}
          {erroQuery === "senha" && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
              Senha atual incorreta.
            </p>
          )}
          {erro && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
              {erro}
            </p>
          )}
          {mensagem && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-3 py-2">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(249,115,22,0.5)] transition hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

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
      </main>
    </div>
  );
}
