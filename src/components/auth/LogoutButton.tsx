"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = () => {
    signOut({
      callbackUrl: "/login"
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      <span>Sair</span>
    </Button>
  );
}
