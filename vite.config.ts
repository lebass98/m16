import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ target: '19' })] }),
    VitePWA({
      registerType: 'autoUpdate',
      // dev에서는 service worker 비활성(devOptions.enabled: false) → PWA 캐싱은 빌드/프리뷰에서만 동작.
      // 로컬에서 PWA를 확인하려면 enabled: true 로 바꾸거나 `npm run build && npm run preview` 사용.
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '워드앤코드 퍼블리싱 프로젝트',
        short_name: 'M16',
        description: '웹 프로젝트 페이지의 PC/모바일 진행도, 카테고리, 미리보기를 한 화면에서 관리하는 워드앤코드 퍼블리싱 대시보드.',
        theme_color: '#0a0a0a',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'ko-KR',
        scope: './',
        start_url: './',
        icons: [
          // favicon.svg 한 장으로 모든 사이즈 대응 (any + maskable). 별도 PNG 필요시 추가.
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // SPA 라우팅 fallback
        navigateFallback: 'index.html',
        // 정적 자산은 사전 캐싱
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // 큰 woff/woff2를 통째로 sw에 넣지 않도록 한도 상향 (Pretendard가 1.1MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // 런타임 캐싱: Google Sheets CSV는 stale-while-revalidate로 오프라인 폴백
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('googleusercontent.com') || url.hostname.endsWith('google.com'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sheets-csv-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
              },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'cdn.jsdelivr.net',
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30일
            },
          },
        ],
      },
    }),
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
