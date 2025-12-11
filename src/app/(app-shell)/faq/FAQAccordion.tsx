"use client";

import { Accordion } from "@/components/ui/accordion";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  return <Accordion items={items} />;
}
