"use client";

import { Button } from "@/components/ui/button";

type CompleteWorkoutButtonProps = {
  treinoId: string;
};

export function CompleteWorkoutButton({ treinoId }: CompleteWorkoutButtonProps) {
  const handleClick = () => {
    // TODO: aqui depois vamos marcar o treino como concluído no banco
    console.log(`Treino concluído: ${treinoId}`);
  };

  return (
    <Button variant="ghost" size="sm" className="text-white" onClick={handleClick}>
      Concluir
    </Button>
  );
}
