import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

// 개발 환경에서만 @axe-core/react 활성화 — 접근성 위반을 콘솔에 보고
if (import.meta.env.DEV) {
  import('@axe-core/react').then(({ default: axe }) => {
    import('react-dom').then((ReactDOM) => {
      void axe(React, ReactDOM, 1000);
    });
  }).catch(() => { /* axe 로딩 실패 무시 */ });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
