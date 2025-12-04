import type { DefaultSession } from "next-auth";
import type { TipoUsuario } from "./tipo-usuario";

declare module "next-auth" {
  interface User {
    id: string;
    tipo: TipoUsuario;
    senhaPrecisaTroca: boolean;
    name?: string | null;
    email?: string | null;
  }

  interface Session {
    user: {
      id: string;
      tipo: TipoUsuario;
      senhaPrecisaTroca: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    tipo: TipoUsuario;
    senhaPrecisaTroca: boolean;
  }
}