"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button, Input, Label, Checkbox, Alert } from "@/components/ui";

import type { FeedbackActionState } from "./actions";

type Feedback = {
  id?: number | null;
  nota: number;
  rpe: string | null;
  observacoes: string | null;
} | null;

type Props = {
  treinoId: number;
  feedback: Feedback;
  createAction: (state: FeedbackActionState, formData: FormData) => Promise<FeedbackActionState>;
  updateAction: (state: FeedbackActionState, formData: FormData) => Promise<FeedbackActionState>;
};

const INITIAL_STATE: FeedbackActionState = {
  status: "idle",
  message: null
};

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending}>
      {children}
    </Button>
  );
}

export default function FeedbackSection({ treinoId, feedback, createAction, updateAction }: Props) {
  const [editing, setEditing] = useState(!feedback);
  const [createState, createDispatch] = useFormState(createAction, INITIAL_STATE);
  const [updateState, updateDispatch] = useFormState(updateAction, INITIAL_STATE);
  const [localFeedback, setLocalFeedback] = useState<Feedback>(null);
  const submittedRef = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    setEditing(!feedback);
  }, [feedback?.id]);

  useEffect(() => {
    const success = createState.status === "success" || updateState.status === "success";
    if (!success) return;

    const s = submittedRef.current;
    if (!s) return;

    const nota = s.nota ? Number(s.nota) : 0;
    const rpe = s.rpe && s.rpe.trim().length > 0 ? s.rpe.trim() : null;
    const tempo = s.tempoTreino && s.tempoTreino.trim().length > 0 ? s.tempoTreino.trim() : null;
    const obs = s.observacoes && s.observacoes.trim().length > 0 ? s.observacoes.trim() : null;
    const observacoesFinal = tempo ? `Tempo do treino: ${tempo}\n${obs ?? ""}` : obs;

    setLocalFeedback({
      id: feedback?.id ?? null,
      nota,
      rpe,
      observacoes: observacoesFinal
    });

    setEditing(false);
    submittedRef.current = null;
  }, [createState.status, updateState.status]);

  const formState = feedback && editing ? updateState : createState;

  function parseObservacoes(raw: string | null | undefined) {
    if (!raw) return { tempo: "", restante: "" };
    const m = raw.match(/^Tempo do treino:\s*([^\r\n]+)\r?\n?([\s\S]*)$/);
    if (m) {
      return { tempo: m[1].trim(), restante: (m[2] || "").trim() };
    }
    return { tempo: "", restante: raw };
  }

  if (!feedback || editing) {
    const action = feedback ? updateDispatch : createDispatch;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      const fd = new FormData(e.currentTarget);
      const obj: Record<string, string> = {};
      fd.forEach((v, k) => {
        if (typeof v === "string") obj[k] = v;
      });
      submittedRef.current = obj;
    }

    const parsed = parseObservacoes(feedback?.observacoes ?? "");

    return (
      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="treinoId" value={treinoId} />
        {feedback ? <input type="hidden" name="feedbackId" value={feedback.id ?? ""} /> : null}

        <div>
          <Label htmlFor="nota">Nota (1 a 10)</Label>
          <select
            id="nota"
            name="nota"
            defaultValue={feedback ? String(feedback.nota) : ""}
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="" disabled>
              Selecione
            </option>
            {Array.from({ length: 10 }).map((_, index) => {
              const value = String(index + 1);
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <Label htmlFor="rpe">RPE (opcional)</Label>
          <Input
            id="rpe"
            name="rpe"
            defaultValue={feedback?.rpe ?? ""}
            placeholder="Percepção de esforço"
          />
        </div>

        <div className="flex items-center gap-4">
          <Checkbox
            id="treinoRealizado"
            name="treinoRealizado"
            value="1"
            defaultChecked={Boolean(feedback)}
            label="Marcar treino como realizado"
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="tempoTreino" className="text-xs text-zinc-400 mb-0">Tempo (min)</Label>
            <Input
              id="tempoTreino"
              name="tempoTreino"
              defaultValue={parsed.tempo ?? ""}
              placeholder="ex: 45"
              className="w-20"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={4}
            defaultValue={parsed.restante ?? ""}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Compartilhe como se sentiu no treino"
          />
        </div>

        {formState.message && (
          <Alert variant={formState.status === "error" ? "error" : "success"}>
            {formState.message}
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <SubmitButton>{feedback ? "Atualizar feedback" : "Enviar feedback"}</SubmitButton>
          {feedback && (
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    );
  }

  const shown = localFeedback ?? feedback;

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-2">
        <p className="text-zinc-300">
          <span className="font-medium text-zinc-100">Nota:</span> {shown?.nota}
        </p>
        {shown?.rpe && (
          <p className="text-zinc-300">
            <span className="font-medium text-zinc-100">RPE:</span> {shown.rpe}
          </p>
        )}
        {shown?.observacoes && (
          <p className="whitespace-pre-wrap text-zinc-300">
            <span className="font-medium text-zinc-100">Observações:</span> {shown.observacoes}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setEditing(true)}
        className="text-orange-600 hover:text-orange-500"
      >
        Editar feedback
      </Button>
    </div>
  );
}
