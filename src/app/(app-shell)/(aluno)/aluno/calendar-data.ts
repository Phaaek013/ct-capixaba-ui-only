import { format } from "date-fns";

export type CalendarWorkout = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
};

export const CALENDAR_WORKOUTS: CalendarWorkout[] = [
  {
    id: "treino-a-peito-e-triceps",
    date: "2025-12-08",
    title: "Treino A - Peito e Tríceps",
    subtitle: "9 exercícios"
  },
  {
    id: "cardio-esteira",
    date: "2025-12-08",
    title: "Cardio",
    subtitle: "30 min na esteira"
  },
  {
    id: "treino-b-pernas",
    date: "2025-12-10",
    title: "Treino B - Pernas",
    subtitle: "8 exercícios"
  },
  {
    id: "treino-c-costas-e-biceps",
    date: "2025-12-12",
    title: "Treino C - Costas e Bíceps",
    subtitle: "8 exercícios"
  }
];

export function getWorkoutsForDate(date: Date): CalendarWorkout[] {
  const key = format(date, "yyyy-MM-dd");
  return CALENDAR_WORKOUTS.filter((w) => w.date === key);
}
