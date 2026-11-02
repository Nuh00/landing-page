/*
  THE PLANS AS THE LANDING PRICES THEM (data/billing.ts, the part the landing keeps): the names, the prices, a year as
  ten months. Nothing is sold on the pre-launch page — the plan doors go to the sign-up — so Stripe, the accounts and
  the billing page stay in the terminal's repo. The figures are the terminal's own; change them there first.
*/
/** nothing is bought here */
export const BILLING_ON: boolean = false;
export type Period = 'month' | 'year';

/* THE PLANS ARE BOOK · DESK · SEAT (Noah, 2026-10-02: "new names instead of pinpoint and compass for the plans, i want
   something unique to us but not corny" — three trading-floor nouns, each true of its plan). Book: the dealer book,
   read — the walls, the flip, the tape, the wire. Desk: the whole desk — contracts picked off the levels, the Weigher,
   the paper desk, the backtest, the journal, the room. Seat: a seat on an exchange was bought once and kept — one
   payment, yours for good. They were Pinpoint, Compass and Lifetime; a stored plan under an old key still reads. */
/* THREE PLANS AGAIN (Noah, 2026-10-05: "i still want there to be 3 plans … our top plan being 180 that includes compass"):
   BOOK $75 · TAPE $120 · DESK $180. Each answers one question, the way the rail does — Book: what do the dealers hold
   (Pulse, Terrain, Pinpoint, Alerts); Tape: what is the market doing (Trace, Dossier, scripts); Desk: which contract,
   and where do I practise (Compass, the Weigher, Practice — Desk's at his word later that day — and Community when it
   opens). Tape is a floor noun like the other two, true of its plan — Trace IS the tape. The Seat stays off the page
   (below). */
export type PlanKey = 'book' | 'tape' | 'desk' | 'seat';

interface Plan {
  key: PlanKey;
  name: string;
  kicker: string;
  price: string;
  period: string;
  monthly: number | null;
}
/** The price a card prints for a period: a year is ten months — two months free (the yearly Stripe prices are set so).
    `amount` is the same figure as a number, for a card that ROLLS from one period's price to the other's (Noah,
    2026-10-10: "the transition from monthly to yearly should be smooth for the numbers"); null for a plan with no price. */
export const priceOf = (key: PlanKey, period: Period): { price: string; amount: number | null; period: string; aMonth: string | null; saves: string | null } => {
  const p = planOf(key);
  if (p.monthly == null) return { price: p.price, amount: null, period: p.period, aMonth: null, saves: null };
  if (period === 'year') {
    const yearly = p.monthly * 10;
    return { price: fmtDollars(yearly), amount: yearly, period: 'a year', aMonth: `$${(yearly / 12).toFixed(2)} a month`, saves: `two months free` };
  }
  return { price: p.price, amount: p.monthly, period: p.period, aMonth: null, saves: null };
};
/** a whole-dollar price, `$1,800` — also the shape a rolling price takes on every frame */
export const fmtDollars = (v: number): string => `$${Math.round(v).toLocaleString('en-US')}`;
/** The tiers as the landing prices them. Noah, 2026-09-19: $75 and $180 (they were $125 and $275); the Book $80 since
    2026-10-10 ("make the book plan be 80 dollars instead of 75"). */
/* THE SEAT IS OFF THE PAGE FOR NOW (Noah, 2026-10-05: "we are thinking of removing the custom lifetime plan just until we
   get up and running so you can remove that from the page as of now"). PLANS is what is SOLD — Book and Desk; the Seat
   keeps its key, so a stored plan under it still reads and `planOf('seat')` still names it, and its row below comes back
   to PLANS the day he says so. */
export const PLANS: Plan[] = [
  { key: 'book', name: 'Book', kicker: 'The charts and the book', price: '$80', period: 'a month', monthly: 80 },
  { key: 'tape', name: 'Tape', kicker: 'The tape and the record', price: '$120', period: 'a month', monthly: 120 },
  { key: 'desk', name: 'Desk', kicker: 'The whole desk', price: '$180', period: 'a month', monthly: 180 },
];
const SEAT: Plan = { key: 'seat', name: 'Seat', kicker: 'Everything, for good — paid once', price: 'Custom', period: 'one payment', monthly: null };
export const planOf = (key: PlanKey): Plan => PLANS.find(p => p.key === key) ?? (key === 'seat' ? SEAT : PLANS[PLANS.length - 1]);
