"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type WorkoutFeedbackFormProps = {
  treinoId: string;
};

export default function WorkoutFeedbackForm({ treinoId }: WorkoutFeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Feedback enviado:", { treinoId, feedback });
      setFeedback("");
      alert("Feedback registrado (mock).");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Adicione notas ou comentários sobre seu treino..."
        className="w-full min-h-[96px] resize-y rounded-xl border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="bg-orange-500 text-black hover:bg-orange-400"
          disabled={isSubmitting || !feedback.trim()}
        >
          {isSubmitting ? "Enviando..." : "Enviar feedback"}
        </Button>
      </div>
    </form>
  );
}
