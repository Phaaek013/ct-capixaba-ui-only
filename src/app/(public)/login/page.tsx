// app/(public)/login/page.tsx
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login | CT Capixaba",
  description: "Acesse seus treinos do CT Capixaba.",
};

export default function LoginPage() {
  return (
    <Card className="w-full rounded-2xl border border-border bg-card/90 p-8 shadow-xl space-y-6">
      {/* Cabeçalho do card */}
      <CardHeader className="space-y-2 text-center p-0">
        {/* Logo centralizado acima do texto */}
        <div className="flex justify-center mb-4">
          <img src="/uploads/logoct.png" alt="Logo CT Capixaba" className="h-40 w-auto" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Acesso ao CT Capixaba
        </CardTitle>
        <CardDescription className="text-sm">
          Entre com seu e-mail e senha para acessar seus treinos.
        </CardDescription>
      </CardHeader>

      {/* Formulário */}
      <CardContent className="p-0">
        <LoginForm />
      </CardContent>
    </Card>
  );
}

