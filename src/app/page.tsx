// src/app/page.tsx
import { redirect } from "next/navigation";

// Garante que a página nunca seja pré-renderizada estaticamente
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("/login");
}
