/*
==================================================
  SLAYER TERMINAL - THE SIGNATURE (brand/Signature.tsx)

  "slayer:~ $ open▌" with a hairline under it — in place of the
  logo in the rail's foot, the footer's status line, the launch gate
  and the phone menu. His partner's, taken whole (Noah, 2026-10-03:
  "all of it"), and since 2026-11-01 THE PROMPT TYPES THE SESSION
  (Noah: "something unique to us and only us ... like how opendoor
  have their own logo animation"). Our name is a prompt, so the
  session is what the prompt says, and the cursor after the word is
  the mark's own:

    open          the silver word · the cursor is the foil, blinking on the mark's beat
    pre-market    the secondary ink · a slow blink, the terminal waking
    after hours   the secondary ink · the slow blink, dimmer
    closed        the muted ink · the cursor solid and dim, no blink
    delayed       the feed is behind — the warning ink, the cursor blinking warn

  THE TRANSITION IS THE MOMENT: at 04:00, 09:30, 16:00 and 20:00 ET
  the cursor erases the old word and types the new one, a character
  at a time (brand/sessionPrompt.ts reads the word; the typing is
  here). On mount the word stands at once — the typing is for the
  cross, not the page load. Reduced motion swaps the word and holds
  the cursor. The dot (SignatureDot) remains for the folded rail,
  which has no room for a word. On paper the foil is the galaxy ink
  (Noah: "keep our galaxy color"). Never lime: lime is for what is
  live on the page, not the brand.
==================================================
*/

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { readMarketState } from '../data/marketState';
import { alignBrandLoops } from './brandClock';
import { readSessionPrompt, type CursorState, type SessionWord } from './sessionPrompt';

export type SignatureState = 'live' | 'delayed' | 'closed';

/** each state's flat dot — live has none: its dot is the moving foil (SignatureDot) */
const FLAT_DOT: Record<Exclude<SignatureState, 'live'>, string> = {
  delayed: 'rgb(var(--warn))',
  closed: 'rgb(var(--text-muted))',
};
const WORD_INK: Record<SessionWord, string> = {
  open: 'rgb(var(--silver))',
  'pre-market': 'rgb(var(--text-secondary))',
  'after hours': 'rgb(var(--text-secondary))',
  closed: 'rgb(var(--text-muted))',
  delayed: 'rgb(var(--warn))',
};

/** The market's word — live while it is open, closed when it is shut */
export const useMarketWord = (): SignatureState => {
  const [word, setWord] = useState<SignatureState>(() => readMarketState().word);
  useEffect(() => {
    const id = window.setInterval(() => setWord(readMarketState().word), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return word;
};

/** The prompt's word and cursor, read again every few seconds — the cross lands within the tick */
export const useSessionPrompt = (tickMs = 5_000) => {
  const [prompt, setPrompt] = useState(() => readSessionPrompt());
  useEffect(() => {
    const id = window.setInterval(() => {
      const next = readSessionPrompt();
      setPrompt(p => (p.word === next.word && p.command === next.command ? p : next));
    }, tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return prompt;
};

interface SignatureDotProps {
  state: SignatureState;
  /** the dot's size and placement (a width and a height) */
  className?: string;
  /** an accessible name, when the dot stands alone (the folded rail) */
  label?: string;
}

/** The state's dot — live: the foil panning in a round clip, on the mark's beat. The rail, folded, keeps only this. */
export const SignatureDot = ({ state, className = 'w-[0.5em] h-[0.5em]', label }: SignatureDotProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  /* on the page's beat from the first frame (brand/brandClock.ts) */
  /* a frame later (the speed pass, 2026-10-19): getAnimations({ subtree: true }) resolved the whole subtree's style inside
     the boot's first task (22–47ms on every page); the animationstart net (listenForBrandLoops) pins a loop's first
     frame anyway, so this alignment can wait for the next frame */
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => alignBrandLoops(ref.current));
    return () => cancelAnimationFrame(raf);
  }, [state]);
  const live = state === 'live';
  return (
    <span
      ref={ref}
      className={`relative block rounded-full overflow-hidden shrink-0 ${className}`}
      style={live ? { isolation: 'isolate' } : { background: FLAT_DOT[state] }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-signature-dot={state}
    >
      {live && <span className="sig-foil" style={{ animationDuration: '9s' }} />}
    </span>
  );
};

/* THE TYPING: erase the old word to what the two share, then type the rest — a terminal's pace, not a reveal's */
const TYPE_MS = 48;
const ERASE_MS = 30;
const PAUSE_MS = 160;

/** the word as the prompt has typed it so far, and whether the cursor is mid-word */
const useTypedWord = (target: string): { shown: string; typing: boolean } => {
  const [shown, setShown] = useState(target);
  const [typing, setTyping] = useState(false);
  const standing = useRef(target);
  useEffect(() => {
    if (target === standing.current) return;
    const from = standing.current;
    standing.current = target;
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(target);
      return;
    }
    let text = from;
    let timer = 0;
    setTyping(true);
    const step = () => {
      if (!target.startsWith(text)) {
        text = text.slice(0, -1);
        setShown(text);
        timer = window.setTimeout(step, ERASE_MS);
        return;
      }
      if (text.length < target.length) {
        text = target.slice(0, text.length + 1);
        setShown(text);
        timer = window.setTimeout(step, TYPE_MS);
        return;
      }
      setTyping(false);
    };
    timer = window.setTimeout(step, PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [target]);
  return { shown, typing };
};

/** THE CURSOR after the word — the mark's: the foil on the page's beat while open, a slow blink before and after the
    session, solid and dim when closed, the warning ink when the feed is behind; steady while a word is being typed */
export const SessionCursor = ({ state, typing = false, className = '' }: { state: CursorState; typing?: boolean; className?: string }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => alignBrandLoops(ref.current));
    return () => cancelAnimationFrame(raf);
  }, [state, typing]);
  return (
    <span ref={ref} className={`sig-cursor ${className}`} data-sig-cursor={state} data-sig-typing={typing || undefined} aria-hidden>
      {state === 'open' && <span className="sig-foil" style={{ animationDuration: '9s' }} />}
    </span>
  );
};

interface SignatureProps {
  /** the state word; the market's own when left out — `delayed` overrides the session's word, `live` and `closed` defer to it */
  state?: SignatureState;
  /** words after the state, in the muted ink ("· v1.0.0") */
  detail?: ReactNode;
  /** the hairline under it — on by default */
  rule?: boolean;
  className?: string;
}

const Signature = ({ state, detail, rule = true, className = '' }: SignatureProps) => {
  const prompt = useSessionPrompt();
  const word: SessionWord = state === 'delayed' ? 'delayed' : prompt.word;
  const cursor: CursorState = state === 'delayed' ? 'delayed' : prompt.cursor;
  const { shown, typing } = useTypedWord(word);
  return (
    <span
      className={`inline-flex items-center gap-[0.6em] font-mono whitespace-nowrap leading-none ${rule ? 'pb-[0.55em] border-b border-ink/[0.14]' : ''} ${className}`}
      data-signature={word}
      data-signature-shown={shown}
    >
      <span className="text-textPrimary">slayer:~ $</span>
      <span className="inline-flex items-center gap-[0.15em]">
        <span style={{ color: WORD_INK[word] }}>{shown}</span>
        <SessionCursor state={cursor} typing={typing} />
      </span>
      {detail != null && <span className="text-textMuted">{detail}</span>}
    </span>
  );
};

export default Signature;
