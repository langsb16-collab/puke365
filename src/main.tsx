import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { LanguageProvider } from './LanguageContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// 브라우저 확장 프로그램 등의 불필요한 콘솔 에러 필터링
const originalError = console.error;
console.error = (...args) => {
  // IndexedDB 관련 에러 무시 (브라우저 확장 프로그램)
  const message = args[0]?.toString() || '';
  if (
    message.includes('IDBDatabase') ||
    message.includes('indexedDB') ||
    message.includes('full version was not allowed')
  ) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
