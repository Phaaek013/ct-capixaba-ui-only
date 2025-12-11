"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MarkWorkoutDoneButtonProps = {
  treinoId: string;
};

export default function MarkWorkoutDoneButton({ treinoId }: MarkWorkoutDoneButtonProps) {
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isDone) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Treino marcado como feito:", { treinoId });
      setIsDone(true);
      alert("Treino marcado como feito (mock).");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isDone}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-base font-semibold text-black hover:bg-orange-400"
    >
      <CheckCircle2 className="h-5 w-5" />
      {isDone ? "Treino concluído" : "Marcar como feito"}
    </Button>
  );
}
