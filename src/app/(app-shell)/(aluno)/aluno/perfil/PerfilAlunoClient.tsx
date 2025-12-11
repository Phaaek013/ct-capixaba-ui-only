"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

type PerfilAlunoClientProps = {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  mensalidade: {
    diaVencimentoMensalidade: number | null;
    proximoVencimentoEm: string | null;
  };
};

export default function PerfilAlunoClient({ user, mensalidade }: PerfilAlunoClientProps) {
  const router = useRouter();

  const [nome, setNome] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [senhaErro, setSenhaErro] = useState<string | null>(null);
  const [senhaSucesso, setSenhaSucesso] = useState<string | null>(null);
  const [senhaLoading, setSenhaLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { diaVencimentoMensalidade, proximoVencimentoEm } = mensalidade;
  const labelVencimento = diaVencimentoMensalidade
    ? `Todo dia ${diaVencimentoMensalidade}`
    : "Dia de vencimento ainda não definido pelo coach";
  const proximoVencimentoLabel = proximoVencimentoEm
    ? new Date(proximoVencimentoEm).toLocaleDateString("pt-BR")
    : null;

  const initials = nome
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "AL";

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Envie uma imagem de até 2MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/aluno/avatar", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        console.error("Erro ao enviar avatar:", await res.text());
        alert("Não foi possível enviar a foto. Tente novamente.");
        return;
      }

      const data = await res.json();
      if (data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro inesperado ao enviar avatar:", error);
      alert("Erro inesperado ao enviar a foto.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const canSaveName = nome.trim().length >= 3 && nome.trim() !== user.name;

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSaveName || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/aluno/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome: nome.trim() })
      });

      if (!res.ok) {
        console.error("Erro ao atualizar perfil:", await res.text());
        alert("Não foi possível salvar os dados. Tente novamente.");
        return;
      }

      router.refresh();
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro inesperado ao salvar perfil:", error);
      alert("Erro inesperado ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (senhaLoading) return;

    setSenhaErro(null);
    setSenhaSucesso(null);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaErro("Preencha todos os campos de senha.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setSenhaErro("A confirmação de senha não confere.");
      return;
    }

    if (novaSenha.length < MIN_PASSWORD_LENGTH) {
      setSenhaErro(`A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setSenhaLoading(true);

    try {
      const response = await fetch("/api/aluno/perfil/senha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha
        }),
        credentials: "include"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setSenhaErro(data?.error ?? "Não foi possível atualizar a senha.");
        return;
      }

      setSenhaSucesso("Senha atualizada com sucesso.");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error("Erro inesperado ao atualizar senha:", error);
      setSenhaErro("Erro inesperado ao atualizar a senha.");
    } finally {
      setSenhaLoading(false);
    }
  }

  function handleCancelar() {
    setNome(user.name);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setSenhaErro(null);
    setSenhaSucesso(null);
  }

  return (
    <div className="space-y-8">
      <form className="space-y-8" onSubmit={handleSaveProfile}>
        <div className="flex flex-col items-center gap-2">
          {avatarUrl ? (
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-orange-500 bg-black/40">
              <img src={avatarUrl} alt={`Foto de perfil de ${nome}`} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-2xl font-semibold text-black">
              {initials}
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={handlePickFile}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePickFile();
              }
            }}
            className="cursor-pointer text-xs font-medium text-orange-400 hover:text-orange-300"
          >
            {isUploading ? "Enviando..." : "Alterar foto"}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Informe seu nome completo" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
            <Input value={user.email} disabled className="opacity-80" />
            <p className="text-xs text-muted-foreground">Este e-mail é usado para login e não pode ser alterado aqui.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-700 bg-transparent text-sm text-zinc-200 hover:bg-zinc-900/80"
            onClick={handleCancelar}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSaveName || isSaving} className="rounded-full px-6">
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-200">
        <p className="font-medium text-zinc-100">Mensalidade</p>
        <p className="mt-1 text-zinc-300">{labelVencimento}</p>
        {proximoVencimentoLabel && (
          <p className="mt-1 text-xs text-zinc-400">
            Próximo vencimento em:{" "}
            <span className="font-semibold text-zinc-200">{proximoVencimentoLabel}</span>
          </p>
        )}
      </div>

      <form className="space-y-4 border-t border-white/10 pt-4" onSubmit={handleChangePassword}>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Alterar senha</h3>
          <p className="text-xs text-muted-foreground">Atualize sua senha para continuar acessando o CT Capixaba com segurança.</p>
        </div>

        {senhaErro && <p className="text-sm text-red-400">{senhaErro}</p>}
        {senhaSucesso && <p className="text-sm text-emerald-400">{senhaSucesso}</p>}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Senha atual</label>
          <PasswordInput value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Informe sua senha atual" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova senha</label>
          <PasswordInput value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Informe a nova senha" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmar nova senha</label>
          <PasswordInput value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Confirme a nova senha" />
        </div>

        <Button type="submit" disabled={senhaLoading} className="w-full px-6 sm:w-auto">
          {senhaLoading ? "Atualizando..." : "Atualizar senha"}
        </Button>
      </form>

      {/* Seção de ajuda e informações */}
      <section className="border-t border-white/10 pt-6 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">
          Ajuda e informações
        </h2>

        <div className="flex flex-col gap-2 text-sm">
          <Link href="/faq" className="text-orange-400 hover:underline">
            FAQ – Dúvidas frequentes
          </Link>
          <Link href="/termos" className="text-orange-400 hover:underline">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="text-orange-400 hover:underline">
            Política de privacidade
          </Link>
        </div>
      </section>
    </div>
  );
}
