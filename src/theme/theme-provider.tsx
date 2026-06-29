import type { ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import { useMemo, useEffect } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { createTheme } from './create-theme';

import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: ThemeOptions;
  direction?: 'ltr' | 'rtl';
};

const ltrCache = createCache({ key: 'mui', prepend: true });
const rtlCache = createCache({
  key: 'mui-rtl',
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});

export function ThemeProvider({ themeOverrides, direction = 'ltr', children, ...other }: ThemeProviderProps) {
  const theme = useMemo(
    () => createTheme({ themeOverrides: { ...themeOverrides, direction } }),
    [themeOverrides, direction]
  );

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <CacheProvider value={direction === 'rtl' ? rtlCache : ltrCache}>
      <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
        <CssBaseline />
        {children}
      </ThemeVarsProvider>
    </CacheProvider>
  );
}
