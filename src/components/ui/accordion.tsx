"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/50",
                isOpen && "bg-zinc-800/30"
              )}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96" : "max-h-0"
              )}
            >
              <p className="px-4 pb-4 pt-1 text-sm text-zinc-400">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
