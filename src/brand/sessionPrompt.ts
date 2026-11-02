/*
==================================================
  SLAYER TERMINAL - THE PROMPT'S WORD (brand/sessionPrompt.ts)

  The session as the terminal says it (Noah, 2026-11-01: "i want
  to change the closed open pre market etc look on our page
  something unique to us and only us ... like how opendoor have
  their own logo animation"). Our name is a prompt, so the prompt
  TYPES the session: four words and one command.

    open          09:30–16:00 ET (13:00 on an early close)   $ close in 3:41:02
    pre-market    04:00–09:30 ET on a trading day            $ open in 6:50
    after hours   16:00–20:00 ET on a trading day            $ opens tomorrow 9:30
    closed        the overnight, weekends, holidays          $ pre-market in 2:14 · opens Mon 9:30

  plus `delayed` when a caller says the feed is behind. The word
  is the market's own reading (data/marketState.ts) so the mark,
  the signature and the favicon never disagree; the command is the
  time to the next cross on the New York clock. The cursor after
  the word is the mark's: the foil on the page's beat while open,
  a slow blink before and after, solid and dim when closed.
==================================================
*/

import { readMarketState, nextTradingDay } from '../data/marketState';
import { readSessionClock } from '../data/moc';
import { EARLY_CLOSES } from '../data/marketState';
import { isoDate } from '../core/calendar';

export type SessionWord = 'open' | 'pre-market' | 'after hours' | 'closed' | 'delayed';
/** the cursor's state — what it does after the word */
export type CursorState = 'open' | 'pre' | 'after' | 'closed' | 'delayed';

export interface SessionPrompt {
  word: SessionWord;
  cursor: CursorState;
  /** the command after the prompt: "close in 3:41:02", "open in 6:50", "opens Mon 9:30" */
  command: string;
}

const PRE_OPEN_MIN = 4 * 60;
const OPEN_MIN = 9 * 60 + 30;
const CLOSE_MIN = 16 * 60;
const EARLY_CLOSE_MIN = 13 * 60;
const AFTER_END_MIN = 20 * 60;

/** "3:41:02" over an hour, "6:50" under one, never a bare count of seconds */
const hms = (seconds: number): string => {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** the New York calendar day as a local Date (midnight), from the clock's wall time */
const nyDay = (now: Date): Date => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(x => [x.type, x.value]));
  return new Date(Number(p.year), Number(p.month) - 1, Number(p.day));
};

/** "opens tomorrow 9:30" when the next session is the next calendar day, "opens Mon 9:30" otherwise */
const opensWord = (today: Date): string => {
  const next = nextTradingDay(today);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  return days === 1 ? 'opens tomorrow 9:30' : `opens ${WEEKDAY[next.getDay()]} 9:30`;
};

export function readSessionPrompt(now: Date = new Date()): SessionPrompt {
  const market = readMarketState(now);
  const clock = readSessionClock(now);
  const [h, m, s] = clock.etTime.split(':').map(Number);
  const mins = h * 60 + m;
  const secOfDay = mins * 60 + s;
  const today = nyDay(now);
  const early = EARLY_CLOSES.has(isoDate(today));

  if (market.word === 'live') {
    const closeMin = early ? EARLY_CLOSE_MIN : CLOSE_MIN;
    return { word: 'open', cursor: 'open', command: `close in ${hms(closeMin * 60 - secOfDay)}` };
  }
  if (market.kind === 'pre-market' && mins >= PRE_OPEN_MIN) {
    return { word: 'pre-market', cursor: 'pre', command: `open in ${hms(OPEN_MIN * 60 - secOfDay)}` };
  }
  if (market.kind === 'after-hours' && mins < AFTER_END_MIN) {
    return { word: 'after hours', cursor: 'after', command: opensWord(today) };
  }
  /* closed: the overnight of a trading day → the pre-market ahead; a weekend or a holiday → the next open */
  const tradingToday = !clock.marketClosedToday;
  if (tradingToday && mins < PRE_OPEN_MIN) {
    return { word: 'closed', cursor: 'closed', command: `pre-market in ${hms(PRE_OPEN_MIN * 60 - secOfDay)}` };
  }
  return { word: 'closed', cursor: 'closed', command: opensWord(today) };
}
