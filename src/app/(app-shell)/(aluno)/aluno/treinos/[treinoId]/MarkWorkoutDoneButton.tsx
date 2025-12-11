"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface MarkWorkoutDoneButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function MarkWorkoutDoneButton({ onClick, loading }: MarkWorkoutDoneButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-4 text-base font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <CheckCircle2 className="h-5 w-5" />
      {loading ? "Enviando..." : "Marcar como feito"}
    </Button>
  );
}
