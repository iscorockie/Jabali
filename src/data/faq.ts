export interface FaqEntry {
  id: string;
  topic: 'permits' | 'fitness' | 'payment' | 'logistics';
  question: string;
  answer: string;
}

/**
 * Field-desk FAQ. `topic` lets the booking engine surface the permit/payment
 * subset while the home page shows the general list.
 */
export const FAQ_ITEMS: FaqEntry[] = [
  {
    id: 'faq-permit-lead',
    topic: 'permits',
    question: 'How far ahead must a Bwindi gorilla permit be secured?',
    answer:
      'UWA caps mountain gorilla trekking at 8 visitors per habituated family per day (roughly 112 permits across Bwindi’s four sectors). During peak dry months (June–September, December–February) Rushaga and Nkuringo families often close out 4–6 months ahead; Buhoma and Ruhija can clear within 6–10 weeks. Our booking engine holds your permit the moment payment clears, and the 48-hour inquiry hold lets you lock sector preference while you confirm flights.',
  },
  {
    id: 'faq-permit-cost',
    topic: 'permits',
    question: 'Why is the $800 permit shown separately from the safari price?',
    answer:
      'Because it is a government fee, not a margin. Foreign Non-Resident permits are $800, Foreign Resident $700 and EAC citizen $80 (Kibale chimpanzee permits are $250 / $200 / $30). We pass the fee straight through at face value and itemise it as its own line on your Stripe invoice and receipt, so you can see exactly what goes to UWA and what funds your guides, vehicles and lodges.',
  },
  {
    id: 'faq-fitness',
    topic: 'fitness',
    question: 'How fit do I need to be to trek mountain gorillas?',
    answer:
      'Trekking ranges from a 45-minute walk on graded trails to 5–7 hours in steep, slippery, 2,300m-altitude terrain. There is no way to predict the family’s daily position. If you want certainty, book the Rushaga 4-hour Gorilla Habituation Experience (flat-ish trails, more time with the group) and add a community porter ($65) — they carry your pack and physically assist on ascents. Guests with mobility constraints are matched to sectors with the shortest average treks.',
  },
  {
    id: 'faq-children',
    topic: 'logistics',
    question: 'Is there a minimum age for gorilla or chimpanzee tracking?',
    answer:
      'UWA sets a strict 15-year minimum for gorilla trekking and 12 years for chimpanzee tracking — no exceptions, as permits are tied to passport details. Children under 15 join our family-friendly add-ons instead: Lake Mutanda canoeing, Batwa cultural trails, Bigodi Wetland boardwalk walks, Ziwa rhino tracking on foot and Queen Elizabeth boat safaris, all of which have no age floor.',
  },
  {
    id: 'faq-payment',
    topic: 'payment',
    question: 'Can I pay a deposit now and settle the balance later?',
    answer:
      'Yes. Choose the “30% deposit + full UWA permits” plan at checkout: you pay 30% of the land package plus 100% of the permit fees (UWA requires permits paid in full at issue) and the balance is invoiced 60 days before departure. All payments run through Stripe Checkout or the embedded Payment Element — cards, Apple Pay, Google Pay, bank transfer and mobile money where available.',
  },
  {
    id: 'faq-cancel',
    topic: 'payment',
    question: 'What happens if I need to change or cancel my dates?',
    answer:
      'Date transfers are complimentary up to 60 days before departure and are processed from your confirmation page — the permit is re-issued in your name at no extra cost. Inside 60 days, UWA permit fees are non-refundable and non-transferable per government regulation; land elements follow our tiered schedule (100% outside 60 days, 50% at 30–60 days, nil inside 30 days). We always recommend AMREF-covered trip cancellation insurance; that cover is included in your package.',
  },
  {
    id: 'faq-flights',
    topic: 'logistics',
    question: 'Should we drive or take bush flights between parks?',
    answer:
      'Entebbe → Bwindi is a 9–10 hour tarmac drive; the 75-minute AeroLink flight to Kihihi costs $480 per person and returns most of a day for trekking. For Kidepo we include round-trip flights as the road approach is 12+ hours. Our default recommendation: fly one way, drive the other, so the Rift escarpment scenery is still part of the trip.',
  },
  {
    id: 'faq-single',
    topic: 'logistics',
    question: 'How do single travellers and small groups work?',
    answer:
      'Scheduled departures are capped at six travelers per extended-wheelbase Land Cruiser, with a guaranteed window and roof hatch seat each. Single travellers are matched by gender for shared lodging on request; a single-supplement applies only at lodges that price twin occupancy, and it is quoted line-by-line before you pay. Groups of 7+ move automatically to a private charter at a lower per-person cost than two shared seats.',
  },
];

export const FAQ_TOPIC_LABELS: Record<FaqEntry['topic'], string> = {
  permits: 'UWA permits',
  fitness: 'Fitness & trekking',
  payment: 'Payments & changes',
  logistics: 'Logistics on the ground',
};
