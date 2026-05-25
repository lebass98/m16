import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ target: '19' })] }),
  ],
  base: './',
  build: {
    // 큰 의존성을 별도 청크로 분리 → 초기 진입 번들 감소 + 캐시 활용도 향상
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui/icons-material')) return 'mui-icons';
          if (id.includes('@mui/x-data-grid')) return 'mui-datagrid';
          if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/base')) return 'mui-core';
          if (id.includes('@emotion/')) return 'emotion';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('/react/') || id.endsWith('/react')) return 'react';
          if (id.includes('fuse.js')) return 'fuse';
          if (id.includes('@iconify/')) return 'iconify';
          return undefined;
        },
      },
    },
    // 1.1MB+ 경고를 가시화하기 위해 임계치 유지(기본 500KB)
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
