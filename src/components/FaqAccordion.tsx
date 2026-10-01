'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, MessageSquareQuote, Search } from 'lucide-react';
import Accordion from '@/components/ui/Accordion';
import { FAQ_ITEMS, FAQ_TOPIC_LABELS, type FaqEntry } from '@/data/faq';

const TOPICS: { id: 'all' | FaqEntry['topic']; label: string }[] = [
  { id: 'all', label: 'All questions' },
  { id: 'permits', label: 'UWA permits' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'payment', label: 'Payments' },
  { id: 'logistics', label: 'Logistics' },
];

export default function FaqAccordion({
  limitTo,
  showSearch = true,
  id = 'faq',
}: {
  limitTo?: FaqEntry['topic'][];
  showSearch?: boolean;
  id?: string;
}) {
  const [topic, setTopic] = useState<'all' | FaqEntry['topic']>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((f) => {
      if (limitTo && !limitTo.includes(f.topic)) return false;
      if (topic !== 'all' && f.topic !== topic) return false;
      if (q && !`${f.question} ${f.answer}`.toLowerCase().includes(q)) return false;
      return true;
    }).map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      meta: FAQ_TOPIC_LABELS[f.topic],
    }));
  }, [topic, query, limitTo]);

  return (
    <div id={id} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {TOPICS.filter((t) => !limitTo || limitTo.includes(t.id as FaqEntry['topic'])).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={`chip transition-all ${
                topic === t.id
                  ? '!border-canopy !bg-canopy !text-parchment'
                  : 'hover:-translate-y-px hover:!border-terracotta/45'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {showSearch ? (
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the field FAQ…"
              aria-label="Search frequently asked questions"
              className="field !py-2 pl-8 text-xs"
            />
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
          <HelpCircle className="h-6 w-6 text-terracotta" />
          <p className="font-display text-base font-semibold text-heading">
            Nothing matches “{query}” yet
          </p>
          <p className="max-w-md text-sm text-ink-muted">
            Our Kampala desk answers bespoke questions within a few hours — including sector
            strategy, permit re-issues and fitness assessments.
          </p>
          <Link href="/contact" className="btn btn-primary !py-2.5 text-xs">
            <MessageSquareQuote className="h-4 w-4" />
            Ask a field specialist
          </Link>
        </div>
      ) : (
        <Accordion items={items} defaultOpenId={items[0]?.id} />
      )}
    </div>
  );
}
