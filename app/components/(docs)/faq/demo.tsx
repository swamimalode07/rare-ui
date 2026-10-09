"use client";

import { Faq, type FaqItem } from "@/components/ui/faq";

const ITEMS: FaqItem[] = [
  {
    id: "what-is-rare-ui",
    question: "What is Rare UI?",
    answer:
      "A collection of animated React components built with Tailwind CSS and Motion. You copy the source into your project and own it from there.",
  },
  {
    id: "is-it-free",
    question: "Is it free?",
    answer:
      "Yes. Every component is free to use in personal and commercial projects. Sponsorship is optional and keeps the project going.",
  },
  {
    id: "install",
    question: "How do I install a component?",
    answer:
      "Add it with the shadcn CLI. The source lands in your components/ui folder, ready to edit.",
  },
  {
    id: "commercial-use",
    question: "Can I use it in commercial projects?",
    answer:
      "Yes, closed source included, as long as you credit Rare UI with a visible link to rareui.com.",
  },
  {
    id: "resell",
    question: "Can I resell the components?",
    answer:
      "No. You can't sell, sublicense, or redistribute them on their own, or bundled into a template, kit, theme, or course.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto px-6 py-16">
      <Faq items={ITEMS} defaultValue="what-is-rare-ui" />
    </div>
  );
}
