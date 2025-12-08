import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

function HeaderBrand() {
  return (
    <header className="border-b border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/aluno" className="flex items-center gap-4">
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
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

export default HeaderBrand;
