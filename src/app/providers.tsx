'use client';
import { useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider, useTheme } from 'next-themes';

import { makeStore, AppStore, useDispatch } from '@/store';
import { init } from '@/actions';

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light';
      if (resolvedTheme === systemTheme) {
        setTheme('system');
      }
    }

    onMediaChange();
    media.addEventListener('change', onMediaChange);
    return () => {
      media.removeEventListener('change', onMediaChange);
    };
  }, [resolvedTheme, setTheme]);

  return null;
}

function Initializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <ThemeWatcher />
      <ReduxProvider store={storeRef.current}>
        <Initializer />
        {children}
      </ReduxProvider>
    </ThemeProvider>
  );
}
