"use client";

import { ChangeEvent } from "react";

interface WorkoutFeedbackFormProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function WorkoutFeedbackForm({ value, onChange, disabled }: WorkoutFeedbackFormProps) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Registrar feedback</p>
      <p className="text-xs text-muted-foreground">Use este espaço para contar ao coach como foi o treino de hoje.</p>
      <textarea
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={4}
        className="w-full rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="Ex.: Muito pesado, joelho incomodou, posso aumentar a carga no supino…"
      />
    </div>
  );
}
