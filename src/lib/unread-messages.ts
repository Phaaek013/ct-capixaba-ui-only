import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";

type UnreadMessagesResult = {
  unreadCount: number;
  href: string;
};

export async function getUnreadMessagesInfo() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.tipo) {
    return { unreadCount: 0, href: "/login" } as const;
  }

  const usuarioId = Number(session.user.id);
  if (!Number.isFinite(usuarioId)) {
    return { unreadCount: 0, href: "/login" } as const;
  }

  const info = await getUnreadMessagesInfoForUser(usuarioId, session.user.tipo as TipoUsuario);
  return info ?? { unreadCount: 0, href: session.user.tipo === TipoUsuario.Aluno ? "/aluno/feedback" : "/coach/feedbacks" };
}

export async function getUnreadMessagesInfoForUser(
  usuarioId: number,
  tipo: TipoUsuario
): Promise<UnreadMessagesResult | null> {
  if (tipo === TipoUsuario.Aluno) {
    const unreadCount = await prisma.treinoConclusao.count({
      where: {
        usuarioId,
        mensagens: {
          some: {
            autor: {
              tipo: {
                in: [TipoUsuario.Coach, TipoUsuario.Admin]
              }
            },
            lidoPeloAlunoEm: null
          }
        }
      }
    });

    if (unreadCount === 0) {
      return null;
    }

    return { unreadCount, href: "/aluno/feedback" };
  }

  if (tipo === TipoUsuario.Coach || tipo === TipoUsuario.Admin) {
    const unreadCount = await prisma.treinoConclusao.count({
      where: {
        mensagens: {
          some: {
            autor: {
              tipo: TipoUsuario.Aluno
            },
            lidoPeloCoachEm: null
          }
        }
      }
    });

    if (unreadCount === 0) {
      return null;
    }

    return { unreadCount, href: "/coach/feedbacks" };
  }

  return null;
}
