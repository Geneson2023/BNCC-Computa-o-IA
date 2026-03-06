import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite websocket errors that are expected in this environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      event.reason.message?.includes('vite') || 
      event.reason.message?.includes('WebSocket') ||
      event.reason.message?.includes('HMR') ||
      event.reason.message?.includes('fechado sem ter sido aberto')
    )) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('vite') || 
      event.message.includes('WebSocket') ||
      event.message.includes('HMR') ||
      event.message.includes('fechado sem ter sido aberto')
    )) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
