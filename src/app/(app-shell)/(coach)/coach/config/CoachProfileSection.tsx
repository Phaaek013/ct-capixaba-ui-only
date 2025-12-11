"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CoachProfileSectionProps {
  coach: {
    nome: string;
    email: string;
    avatarUrl: string | null;
  };
}

export function CoachProfileSection({ coach }: CoachProfileSectionProps) {
  const router = useRouter();
  const [nome, setNome] = useState(coach.nome);
  const [email, setEmail] = useState(coach.email);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(coach.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  }

  async function handleSalvarPerfil(event: React.FormEvent) {
    event.preventDefault();
    if (salvando) return;
    setMensagem(null);
    setErro(null);
    setSalvando(true);

    try {
      const formData = new FormData();
      formData.append("nome", nome.trim());
      formData.append("email", email.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch("/api/coach/perfil", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erro ao salvar perfil.");
      }

      const data = await res.json();
      if (data.avatarUrl) {
        setAvatarPreview(data.avatarUrl);
        setAvatarFile(null);
      }
      setMensagem("Perfil atualizado com sucesso!");
      router.refresh();
      setTimeout(() => setMensagem(null), 4000);
    } catch (error) {
      console.error(error);
      setErro(error instanceof Error ? error.message : "Erro inesperado ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="rounded-2xl bg-[#111111] border border-zinc-800 p-6 flex flex-col items-center gap-4 text-center">
        <div className="h-24 w-24 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="Avatar do coach" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-zinc-200">
              {coach.nome?.[0]?.toUpperCase() ?? "C"}
            </span>
          )}
        </div>
        <label className="cursor-pointer text-sm text-orange-400 hover:text-orange-300">
          Trocar foto
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
        <Link
          href="/primeiro-acesso/alterar-senha"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm text-zinc-100 border border-zinc-700 hover:bg-zinc-800 transition"
        >
          Alterar senha
        </Link>
      </div>

      <form
        onSubmit={handleSalvarPerfil}
        className="rounded-2xl bg-[#111111] border border-zinc-800 p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Meu perfil</h2>
          <p className="text-sm text-zinc-400">Atualize seus dados de contato.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}
        {mensagem && <p className="text-sm text-emerald-400">{mensagem}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
