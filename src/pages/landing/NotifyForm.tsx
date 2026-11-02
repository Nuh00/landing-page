/*
==================================================
  SLAYER TERMINAL - THE SIGN-UP (pages/landing/NotifyForm.tsx)

  The pre-launch page's one door (Noah, 2026-11-02:
  "let users subscribe with email and phone number
  to get notified … the bottom should be the place
  where they can fill it out, it should look nice
  and smooth with our logo on it"). A glass card at
  the foot of the page under "Seen enough? Be first
  in.": the mark and the wordmark, one line, the two
  fields, the door, the consent line.

  NETLIFY FORMS carry it (his partner deploys there):
  the form is named, marked data-netlify, and posts
  itself as a URL-encoded body to "/" — Netlify's
  build bot learns the fields from the still copy of
  this form in index.html, since this one is drawn
  after the fact. A honeypot field catches the bots.
  Email is required; the number is optional — a
  required number loses sign-ups.
==================================================
*/

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SlayerMark from '../../brand/SlayerMark';
import Wordmark from '../../brand/Wordmark';
import { MorphingInfinity, useWorking } from '../../components/ui/Working';
import { useBlockGround } from './ground';
import { DOOR_ARROW, DOOR_GROUP, MAIL } from './pieces';

/** the form's name at Netlify — the still copy in index.html carries the same */
export const FORM_NAME = 'notify';

type State = 'idle' | 'sending' | 'done' | 'failed';

const FIELD =
  'mt-2 block w-full h-12 rounded-full border border-borderMuted bg-inputBg px-5 text-[15px] text-textPrimary placeholder:text-textMuted/60 outline-none transition-colors duration-200 focus:border-textPrimary/70 hover:border-textPrimary/40';
const LABEL = 'block font-mono text-[10px] uppercase tracking-[0.2em] text-textMuted';

const NotifyForm = () => {
  const ground = useBlockGround();
  const [state, setState] = useState<State>('idle');
  const working = useWorking(state === 'sending');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'sending') return;
    const body = new URLSearchParams();
    new FormData(e.currentTarget).forEach((v, k) => body.append(k, String(v)));
    setState('sending');
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      setState(r.ok ? 'done' : 'failed');
    } catch {
      setState('failed');
    }
  };

  return (
    <div id="notify" className="mt-12 mx-auto w-full max-w-[600px] text-left scroll-mt-24" data-landing-notify={state}>
      <div className="rounded-[28px] border border-borderSubtle bg-panel/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgb(0_0_0/0.6)] px-6 py-7 sm:px-9 sm:py-9">
        {/* the brand on the card: the mark beside the wordmark with its cursor */}
        <div className="flex items-center gap-3">
          <SlayerMark size={34} label="Slayer Terminal" />
          <Wordmark height={14} cursor label="" />
        </div>
        <p className="mt-6 text-[22px] sm:text-[26px] font-light tracking-[-0.03em] leading-[1.15] text-textPrimary">Be the first through the door.</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-textSecondary">Leave your email, your number, or both. One message the day it opens, and nothing else.</p>

        {state === 'done' ? (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-borderSubtle bg-ink/[0.03] px-5 py-4" role="status" data-notify-done>
            <Check className="mt-0.5 w-4 h-4 shrink-0 text-silver" strokeWidth={2.25} aria-hidden="true" />
            <div>
              <p className="text-[15px] font-medium text-textPrimary">You are on the list.</p>
              <p className="mt-1 text-[13.5px] text-textSecondary">We will write the day it opens.</p>
            </div>
          </div>
        ) : (
          <form name={FORM_NAME} method="POST" action="/" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} className="mt-7" data-notify-form>
            <input type="hidden" name="form-name" value={FORM_NAME} />
            {/* the honeypot: a field no person sees; a bot that fills it is dropped by Netlify */}
            <p className="hidden" aria-hidden="true">
              <label>
                Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className={LABEL}>Email</span>
                <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" inputMode="email" className={FIELD} data-notify-email />
              </label>
              <label className="block">
                <span className={LABEL}>
                  Phone <span className="normal-case tracking-normal text-textMuted/70">· optional</span>
                </span>
                <input type="tel" name="phone" placeholder="+1 555 000 0000" autoComplete="tel" inputMode="tel" className={FIELD} data-notify-phone />
              </label>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="submit"
                disabled={state === 'sending'}
                aria-busy={state === 'sending' || undefined}
                /* the bar's own door stands down while this one is on the screen (pieces.tsx useDoorSeen) */
                data-landing-door="close"
                className={`${DOOR_GROUP} inline-flex items-center justify-center gap-2 h-12 pl-6 pr-5 rounded-full text-[15px] font-medium whitespace-nowrap transition-transform duration-200 ease-out active:scale-[0.98] active:duration-100 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-silver disabled:cursor-progress ${
                  ground === 'dark' ? 'holo-bg text-[#0a0a0a]' : 'galaxy-bg'
                }`}
              >
                Notify me
                {working ? <MorphingInfinity viewBox="4 4 16 16" className="w-4 h-4" /> : <ArrowRight className={`w-4 h-4 ${DOOR_ARROW}`} aria-hidden="true" />}
              </button>
              {state === 'failed' && (
                <p role="alert" className="text-[13px] leading-snug text-warn" data-notify-failed>
                  That did not go through. Try again, or write to{' '}
                  <a href={`mailto:${MAIL}`} className="underline underline-offset-2">
                    {MAIL}
                  </a>
                  .
                </p>
              )}
            </div>
            <p className="mt-5 text-[12.5px] leading-relaxed text-textMuted">
              By signing up you agree to hear from us about the launch, by email or text. You can leave the list any time.{' '}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-textPrimary transition-colors">
                How we handle your details
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default NotifyForm;
