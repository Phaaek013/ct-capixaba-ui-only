"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  subMonths,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTituloFromBlocos, type BlocosTreino } from "@/lib/treino-conteudo";

// ---------- Tipos ----------
type TreinoAlunoDto = {
  id: number;
  dataTreino: string | null;
  conteudo: BlocosTreino;
  videoUrl: string | null;
};

type Props = {
  dataInicialISO: string; // "yyyy-MM-dd"
};

// ---------- Componente ----------
export function WorkoutCalendarClient({ dataInicialISO }: Props) {
  const [selectedDate, setSelectedDate] = useState(() =>
    parseISO(`${dataInicialISO}T00:00:00`)
  );
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  // Estado de treinos vindos da API
  const [treinos, setTreinos] = useState<TreinoAlunoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache de dias com treino (para mostrar bolinhas)
  const [diasComTreino, setDiasComTreino] = useState<Set<string>>(new Set());

  // ---------- Carregar treinos da data selecionada ----------
  async function loadTreinos(dateISO: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/aluno/treinos?data=${dateISO}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar treinos");
      }

      const data = (await res.json()) as TreinoAlunoDto[];
      setTreinos(data);

      // Atualiza o cache de dias com treino
      if (data.length > 0) {
        setDiasComTreino((prev) => {
          const next = new Set(prev);
          next.add(dateISO);
          return next;
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar treinos");
      setTreinos([]);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Carregar todos os treinos (para bolinhas) ----------
  async function loadAllTreinos() {
    try {
      const res = await fetch(`/api/aluno/treinos`, {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as TreinoAlunoDto[];
      const diasSet = new Set<string>();

      data.forEach((treino) => {
        if (treino.dataTreino) {
          diasSet.add(treino.dataTreino.split("T")[0]);
        }
      });

      setDiasComTreino(diasSet);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
    }
  }

  // ---------- Efeitos ----------
  useEffect(() => {
    const dateISO = format(selectedDate, "yyyy-MM-dd");
    loadTreinos(dateISO);
  }, [selectedDate]);

  useEffect(() => {
    // Carrega todos os treinos uma vez para mostrar bolinhas
    loadAllTreinos();
  }, []);

  // ---------- Helpers ----------
  function hasWorkoutOnDay(day: Date): boolean {
    const dateKey = format(day, "yyyy-MM-dd");
    return diasComTreino.has(dateKey);
  }

  function getResumo(treino: TreinoAlunoDto): string {
    const c = treino.conteudo;
    if (c.wod) {
      const firstLine = c.wod.split("\n")[0];
      if (firstLine && firstLine.length > 50) {
        return firstLine.substring(0, 50) + "…";
      }
      return firstLine || "Treino cadastrado";
    }
    return c.foco || "Treino cadastrado";
  }

  // ---------- Cálculos de semana ----------
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    const firstLabel = format(first, "d", { locale: ptBR });
    const lastLabel = format(last, "d MMM", { locale: ptBR });
    return `${firstLabel}–${lastLabel}`;
  }, [weekDays]);

  function handlePrevWeek() {
    setSelectedDate((prev) => addWeeks(prev, -1));
  }

  function handleNextWeek() {
    setSelectedDate((prev) => addWeeks(prev, 1));
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Calendário</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Veja seus treinos passados e futuros.</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-orange-500/60 bg-black/40 text-orange-400 hover:bg-orange-500 hover:text-black"
            type="button"
            onClick={() => {
              setMonthCursor(startOfMonth(selectedDate));
              setIsMonthPickerOpen(true);
            }}
          >
            <CalendarDays className="h-5 w-5" />
            <span className="sr-only">Abrir calendário mensal</span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-black/40 px-3 py-2 sm:px-4 sm:py-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/5"
            type="button"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground sm:text-xs">Semana</span>
            <span className="text-xs font-medium text-foreground sm:text-sm">{weekLabel}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/5"
            type="button"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:justify-between sm:px-0">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const weekdayLabel = format(day, "EEE", { locale: ptBR });
            const dayNumber = format(day, "d", { locale: ptBR });
            const hasTreino = hasWorkoutOnDay(day);

            return (
              <div
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDate(day)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedDate(day);
                  }
                }}
                className="flex min-w-[3rem] flex-col items-center gap-1 text-[0.7rem] cursor-pointer sm:min-w-0 sm:text-xs"
              >
                <span className="uppercase text-[0.6rem] text-muted-foreground">{weekdayLabel}</span>

                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition sm:h-10 sm:w-10",
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                      : "border-orange-500/40 bg-transparent text-foreground hover:bg-orange-500/10"
                  ].join(" ")}
                >
                  {dayNumber}
                </span>

                {hasTreino && (
                  <span
                    className={[
                      "mt-1 h-1.5 w-1.5 rounded-full",
                      isSelected ? "bg-orange-500" : "bg-orange-400/80"
                    ].join(" ")}
                  />
                )}

                {isToday && <span className="mt-1 text-[0.6rem] text-orange-400">hoje</span>}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold sm:text-lg">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
        </div>

        <div className="space-y-3">
          {loading && (
            <p className="text-sm text-muted-foreground">Carregando treinos…</p>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && treinos.length === 0 && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              Nenhum treino cadastrado para este dia.
            </p>
          )}

          {!loading && !error && treinos.map((treino) => {
            const titulo = getTituloFromBlocos(treino.conteudo) || "Treino";
            const resumo = getResumo(treino);

            return (
              <Card key={treino.id} className="flex items-center justify-between bg-black/40 px-3 py-3 sm:px-4">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">{titulo}</h3>
                  <p className="text-xs text-muted-foreground">{resumo}</p>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="ml-2 whitespace-nowrap text-xs text-orange-400 hover:bg-orange-500 hover:text-black sm:text-sm"
                >
                  <Link href={`/aluno/treinos/${treino.id}`}>
                    Ver treino
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>

        {isMonthPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-2xl bg-zinc-950/95 p-4 shadow-xl border border-zinc-800">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/5"
                  type="button"
                  onClick={() => setMonthCursor((prev) => subMonths(prev, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Selecionar data</span>
                  <span className="text-sm font-semibold text-foreground">
                    {format(monthCursor, "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/5"
                  type="button"
                  onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase text-muted-foreground">
                {[
                  "S",
                  "T",
                  "Q",
                  "Q",
                  "S",
                  "S",
                  "D"
                ].map((label, idx) => (
                  <span key={idx}>{label}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const monthStart = startOfMonth(monthCursor);
                  const monthEnd = endOfMonth(monthCursor);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  const startWeekday = Number(format(monthStart, "i")) % 7;
                  const leadingBlanks = startWeekday === 0 ? 0 : startWeekday;
                  const cells: (Date | null)[] = [
                    ...Array.from({ length: leadingBlanks }, () => null),
                    ...days
                  ];

                  return cells.map((day, idx) => {
                    if (!day) {
                      return <div key={`blank-${idx}`} className="h-9 w-full" />;
                    }

                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const hasWorkout = hasWorkoutOnDay(day);

                    return (
                      <div
                        key={day.toISOString()}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedDate(day);
                          setIsMonthPickerOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedDate(day);
                            setIsMonthPickerOpen(false);
                          }
                        }}
                        className="flex h-9 w-full items-center justify-center cursor-pointer"
                      >
                        <div className="relative flex h-8 w-8 items-center justify-center text-xs font-semibold">
                          <span
                            className={[
                              "flex h-7 w-7 items-center justify-center rounded-full transition",
                              isSelected ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.6)]" : "bg-transparent text-foreground"
                            ].join(" ")}
                          >
                            {format(day, "d", { locale: ptBR })}
                          </span>

                          {hasWorkout && <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-orange-400" />}

                          {isToday && !isSelected && (
                            <span className="absolute inset-[2px] rounded-full border border-orange-500/60" />
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMonthPickerOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
