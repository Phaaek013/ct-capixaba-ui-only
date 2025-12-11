"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type WorkoutActionsClientProps = {
  treinoId: string;
};

export default function WorkoutActionsClient({ treinoId }: WorkoutActionsClientProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleMarkDone() {
    if (isDone || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const text = feedback.trim();
      console.log("Treino concluído com feedback:", {
        treinoId,
        feedback: text || null
      });
      setIsDone(true);
      setFeedback("");
      alert("Treino marcado como feito (mock) com feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleMarkDone();
    }
  }

  const disabled = isDone || isSubmitting;

  return (
    <div className="space-y-4">
      {/* Campo de feedback */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Registrar feedback</h2>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Adicione notas ou comentários sobre seu treino..."
          className="w-full min-h-[96px] resize-y rounded-xl border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* CTA “Marcar como feito” sem <button> para fugir do CSS legado */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : handleMarkDone}
        onKeyDown={disabled ? undefined : handleKeyDown}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-full",
          "py-3 text-base font-semibold select-none",
          disabled ? "bg-zinc-700 text-zinc-400 cursor-default" : "bg-orange-500 text-black cursor-pointer hover:bg-orange-400"
        ].join(" ")}
      >
        <CheckCircle2 className="h-5 w-5" />
        {isDone ? "Treino concluído" : "Marcar como feito"}
      </div>
    </div>
  );
}
