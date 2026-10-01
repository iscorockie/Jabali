'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  meta?: string;
}

/** Single-open disclosure list used for FAQ / permit-policy blocks. */
export default function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
}) {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });

  return (
    <div className="divide-y divide-line/10 overflow-hidden rounded-2xl border border-line/12 bg-surface-raised shadow-card">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                  isOpen ? 'bg-acacia-light/60' : 'hover:bg-ink/[0.03]'
                }`}
              >
                <span className="flex flex-col gap-1">
                  {item.meta ? (
                    <span className="font-label text-terracotta">{item.meta}</span>
                  ) : null}
                  <span className="font-display text-[0.98rem] font-semibold text-heading sm:text-base">
                    {item.question}
                  </span>
                </span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? 'rotate-180 border-terracotta/40 bg-terracotta text-white'
                      : 'border-line/20 text-ink-muted'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-ink-muted">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
