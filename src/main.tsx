import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA Offline-First Attendance
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Teacher Attendance OS ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('ServiceWorker registration fallback:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
