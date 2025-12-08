export type WorkoutExercise = {
  name: string;
  reps: string;
};

export type WorkoutDetail = {
  id: string;
  title: string;
  focus: string;
  duration: string;
  performedAt: string;
  exercises: WorkoutExercise[];
};

const RAW_WORKOUTS: WorkoutDetail[] = [
  {
    id: "treino-a-peito-e-triceps",
    title: "Treino A - Peito e Tríceps",
    focus: "Hipertrofia de peitoral e tríceps",
    duration: "45 - 60 min",
    performedAt: "2024-08-11T10:00:00Z",
    exercises: [
      { name: "Supino reto", reps: "4 x 10" },
      { name: "Supino inclinado com halteres", reps: "3 x 12" },
      { name: "Crucifixo", reps: "3 x 15" },
      { name: "Tríceps testa", reps: "4 x 12" },
      { name: "Mergulho no banco", reps: "3 x 15" }
    ]
  },
  {
    id: "treino-b-pernas",
    title: "Treino B - Pernas",
    focus: "Força e estabilidade inferior",
    duration: "60 - 70 min",
    performedAt: "2024-08-13T10:00:00Z",
    exercises: [
      { name: "Agachamento livre", reps: "5 x 8" },
      { name: "Leg press", reps: "4 x 12" },
      { name: "Cadeira extensora", reps: "3 x 15" },
      { name: "Mesa flexora", reps: "3 x 12" },
      { name: "Panturrilha em pé", reps: "4 x 15" }
    ]
  },
  {
    id: "treino-c-costas-e-biceps",
    title: "Treino C - Costas e Bíceps",
    focus: "Espessura de dorsais e força de braço",
    duration: "50 - 65 min",
    performedAt: "2024-08-15T10:00:00Z",
    exercises: [
      { name: "Barra fixa", reps: "4 x máximo" },
      { name: "Remada curvada", reps: "4 x 10" },
      { name: "Puxada na frente", reps: "3 x 12" },
      { name: "Rosca direta", reps: "4 x 12" },
      { name: "Rosca martelo", reps: "3 x 15" }
    ]
  }
];

export const WORKOUT_DETAILS = RAW_WORKOUTS.reduce<Record<string, WorkoutDetail>>((acc, workout) => {
  acc[workout.id] = workout;
  return acc;
}, {});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

function formatShortDate(dateString: string) {
  return dateFormatter.format(new Date(dateString)).replace(".", "");
}

export const LAST_WORKOUTS = Object.values(WORKOUT_DETAILS)
  .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
  .slice(0, 3)
  .map((workout) => ({
    id: workout.id,
    title: workout.title,
    date: formatShortDate(workout.performedAt)
  }));
