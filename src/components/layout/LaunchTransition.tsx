/*
  THE LAUNCH GATE, PRE-LAUNCH (components/layout/LaunchTransition.tsx): in the terminal's repo this plays a branded
  gate and opens the page asked for. Here there is no terminal to open — `launch` takes the reader to the sign-up at
  the foot of the front page (from the legal pages by way of the front page's address), and the provider is a pass.
*/
import { useCallback, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NOTIFY } from '../../data/openDoor';

const calm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** the sign-up card, brought up the screen */
export const toNotify = (): void => {
  document.querySelector(NOTIFY)?.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
};

export const useLaunch = (): { launch: (to?: string) => void } => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const launch = useCallback(
    (_to?: string) => {
      if (pathname === '/') toNotify();
      else navigate(`/${NOTIFY}`);
    },
    [navigate, pathname]
  );
  return { launch };
};

export const LaunchProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
