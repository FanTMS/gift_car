import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { initializeSuperAdmin } from './firebase/adminInitializer';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// В продакшн режиме не используем StrictMode для предотвращения двойного рендеринга
if (process.env.NODE_ENV === 'production') {
  root.render(<App />);
  
  // Инициализируем суперадминистратора в продакшн режиме
  initializeSuperAdmin().catch(console.error);
} else {
  // В разработке используем StrictMode для выявления проблем
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Регистрируем service worker для поддержки PWA в продакшн режиме
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      // Показываем уведомление о доступном обновлении
      const shouldUpdate = window.confirm(
        'Доступна новая версия приложения! Обновить сейчас?'
      );
      if (shouldUpdate && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
  });
} else {
  serviceWorkerRegistration.unregister();
}

// Отправка метрик производительности только в продакшн режиме
if (process.env.NODE_ENV === 'production') {
  // Можно использовать функцию для отправки данных в аналитику
  reportWebVitals(console.log);
}
