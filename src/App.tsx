/*
  THE PRE-LAUNCH SITE (App.tsx): the landing page, its two legal pages, and nothing else — every other address goes
  home. The terminal itself lives in its own repo and opens on the day.
*/
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LaunchProvider } from './components/layout/LaunchTransition';
import Landing from './pages/landing/Landing';

const Terms = lazy(() => import('./pages/landing/legal/Terms'));
const Privacy = lazy(() => import('./pages/landing/legal/Privacy'));

/** a route change lands at the head of the page (a hash is the page's own to follow) */
const ScrollHome = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const App = () => (
  <LaunchProvider>
    <ScrollHome />
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </LaunchProvider>
);

export default App;
