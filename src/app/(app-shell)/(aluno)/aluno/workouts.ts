export type WorkoutGroupSlug =
  | "MOBILIDADE"
  | "ATIVACAO_AQUECIMENTO"
  | "SKILL_FORCA"
  | "WOD"
  | "ACESSORIO";

export const WORKOUT_GROUP_LABEL: Record<WorkoutGroupSlug, string> = {
  MOBILIDADE: "Mobilidade",
  ATIVACAO_AQUECIMENTO: "Ativação / Aquecimento específico",
  SKILL_FORCA: "Skill / força",
  WOD: "WOD",
  ACESSORIO: "Acessório"
};

export type WorkoutExercise = {
  id: string;
  nome: string;
  descricao?: string;
  series?: string;
  grupo: WorkoutGroupSlug;
};

export type WorkoutDetail = {
  id: string;
  title: string;
  subtitle?: string;
  focus?: string;
  duration?: string;
  descricao?: string;
  videoUrl?: string;
  performedAt?: string;
  exercicios: WorkoutExercise[];
};

const WORKOUT_LIST: WorkoutDetail[] = [
  {
    id: "treino-a-peito-e-triceps",
    title: "Treino A - Peito e Tríceps",
    subtitle: "Hipertrofia de peitoral e tríceps",
    focus: "Peito e tríceps",
    duration: "45 - 60 min",
    videoUrl: "https://www.youtube.com/embed/6J7wGmD3vms",
    descricao:
      "Mantenha o tempo de descanso entre 60 e 90 segundos para exercícios compostos e até 45 segundos para isolados.",
    performedAt: "2024-08-11T10:00:00Z",
    exercicios: [
      {
        id: "a-mob-1",
        nome: "Alongamento peitoral na parede",
        descricao: "Mobilidade ombros/peitoral",
        series: "2 x 30s",
        grupo: "MOBILIDADE"
      },
      {
        id: "a-ativ-1",
        nome: "Flexões leves",
        descricao: "Aquecimento específico",
        series: "2 x 10",
        grupo: "ATIVACAO_AQUECIMENTO"
      },
      {
        id: "a-skill-1",
        nome: "Supino reto",
        descricao: "Carga progressiva",
        series: "4 x 10",
        grupo: "SKILL_FORCA"
      },
      {
        id: "a-wod-1",
        nome: "AMRAP 10'",
        descricao: "10 flexões, 15 abdominais, 20 agachamentos",
        grupo: "WOD"
      },
      {
        id: "a-acc-1",
        nome: "Crucifixo máquina",
        series: "3 x 15",
        grupo: "ACESSORIO"
      }
    ] satisfies WorkoutExercise[]
  },
  {
    id: "treino-b-pernas",
    title: "Treino B - Pernas",
    subtitle: "Força, estabilidade e condicionamento",
    focus: "Inferiores",
    duration: "60 - 70 min",
    videoUrl: "https://www.youtube.com/embed/sg-8Vkq1BvA",
    descricao: "Priorize amplitude total e controle da descida para maximizar o estímulo muscular.",
    performedAt: "2024-08-13T10:00:00Z",
    exercicios: [
      {
        id: "b-mob-1",
        nome: "Mobilidade de tornozelo com faixa",
        descricao: "Foque na dorsiflexão",
        series: "2 x 45s",
        grupo: "MOBILIDADE"
      },
      {
        id: "b-ativ-1",
        nome: "Agachamento com peso corporal",
        descricao: "Aquece quadril e joelhos",
        series: "2 x 20",
        grupo: "ATIVACAO_AQUECIMENTO"
      },
      {
        id: "b-skill-1",
        nome: "Agachamento livre",
        series: "5 x 8",
        grupo: "SKILL_FORCA"
      },
      {
        id: "b-skill-2",
        nome: "Leg press",
        series: "4 x 12",
        grupo: "SKILL_FORCA"
      },
      {
        id: "b-wod-1",
        nome: "EMOM 12'",
        descricao: "Min 1: 12 lunges | Min 2: 10 box jumps",
        grupo: "WOD"
      },
      {
        id: "b-acc-1",
        nome: "Panturrilha em pé",
        series: "4 x 15",
        grupo: "ACESSORIO"
      }
    ] satisfies WorkoutExercise[]
  },
  {
    id: "treino-c-costas-e-biceps",
    title: "Treino C - Costas e Bíceps",
    subtitle: "Dorsais espessos e braços fortes",
    focus: "Costas e bíceps",
    duration: "50 - 65 min",
    videoUrl: undefined,
    descricao: "Combine picos de contração com alongamento máximo para ativar toda a cadeia posterior.",
    performedAt: "2024-08-15T10:00:00Z",
    exercicios: [
      {
        id: "c-mob-1",
        nome: "Mobilidade torácica com foam roller",
        series: "2 x 30s",
        grupo: "MOBILIDADE"
      },
      {
        id: "c-ativ-1",
        nome: "Remada elástica leve",
        descricao: "Ativa escápulas",
        series: "2 x 15",
        grupo: "ATIVACAO_AQUECIMENTO"
      },
      {
        id: "c-skill-1",
        nome: "Barra fixa",
        series: "4 x máximo",
        grupo: "SKILL_FORCA"
      },
      {
        id: "c-skill-2",
        nome: "Remada curvada",
        series: "4 x 10",
        grupo: "SKILL_FORCA"
      },
      {
        id: "c-wod-1",
        nome: "For time 5 rounds",
        descricao: "12 puxadas na frente, 15 kettlebell swings, 20 sit-ups",
        grupo: "WOD"
      },
      {
        id: "c-acc-1",
        nome: "Rosca martelo",
        series: "3 x 15",
        grupo: "ACESSORIO"
      }
    ] satisfies WorkoutExercise[]
  }
];

export const WORKOUT_DETAILS = WORKOUT_LIST.reduce<Record<string, WorkoutDetail>>((acc, workout) => {
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

export const LAST_WORKOUTS = WORKOUT_LIST.filter((workout) => workout.performedAt)
  .sort((a, b) => new Date(b.performedAt ?? 0).getTime() - new Date(a.performedAt ?? 0).getTime())
  .slice(0, 3)
  .map((workout) => ({
    id: workout.id,
    title: workout.title,
    date: workout.performedAt ? formatShortDate(workout.performedAt) : "--"
  }));
