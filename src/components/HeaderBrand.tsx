import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { getUnreadMessagesInfo } from "@/lib/unread-messages";
import { TipoUsuario } from "@/types/tipo-usuario";

async function HeaderBrand() {
  const session = await getServerSession(authOptions);
  const { unreadCount, href } = await getUnreadMessagesInfo();

  const tipoUsuario = session?.user?.tipo as TipoUsuario | undefined;
  const homeHref =
    tipoUsuario === TipoUsuario.Coach || tipoUsuario === TipoUsuario.Admin
      ? "/coach"
      : tipoUsuario === TipoUsuario.Aluno
      ? "/aluno"
      : "/";

  return (
    <header className="border-b border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={homeHref} className="flex items-center gap-4">
          <Image
            src="/uploads/logoct.png"
            alt="CT Capixaba"
            width={200}
            height={64}
            className="h-16 w-auto"
            priority
          />
          <span className="sr-only">CT Capixaba</span>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell href={href} unreadCount={unreadCount} />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

export default HeaderBrand;
