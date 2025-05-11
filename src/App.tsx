import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { UserProvider } from './context/UserContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentResultPage from './pages/PaymentResultPage';
import PaymentEmulatorPage from './pages/PaymentEmulatorPage';
import WalletPage from './pages/WalletPage';
import TelegramWalletPage from './pages/wallet/TelegramWalletPage';
import WalletDemoPage from './pages/wallet/WalletDemoPage';
import WalletHistoryPage from './pages/wallet/WalletHistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SuperAdminPage from './pages/admin/SuperAdminPage';
import { initializeTelegramApp, applyTelegramStyles } from './utils/telegramUtils';
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  useEffect(() => {
    // Инициализация Telegram Mini App
    if (window.Telegram?.WebApp) {
      // Инициализируем Telegram Mini App с голубым заголовком
      initializeTelegramApp('#1E88E5');
      
      // Применяем стили Telegram к приложению
      applyTelegramStyles();
    }

    // Предотвращение жестов масштабирования
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Блокировка двойного тапа для зума
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Запрет на скролл body
    const preventBodyScroll = () => {
      document.body.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault();
        }
      }, { passive: false });
    };

    // Добавляем обработчики событий
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    preventBodyScroll();

    // Фиксируем высоту для мобильных устройств
    const setMobileHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Вызываем при загрузке и изменении размера
    setMobileHeight();
    window.addEventListener('resize', setMobileHeight);

    return () => {
      // Удаляем обработчики при размонтировании
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      window.removeEventListener('resize', setMobileHeight);
    };
  }, []);

  return (
    <FirebaseProvider>
      <UserProvider>
        <AppThemeProvider>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="raffles" element={<HomePage />} />
                <Route path="raffles/:raffleId" element={<RaffleDetailPage />} />
                <Route path="raffles/:raffleId/buy" element={<RaffleDetailPage />} />
                <Route path="admin/*" element={<AdminPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="payment/result" element={<PaymentResultPage />} />
                <Route path="payment-emulator" element={<PaymentEmulatorPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="wallet/history" element={<WalletHistoryPage />} />
                <Route path="wallet/transaction/:id" element={<WalletPage />} />
                <Route path="wallet/telegram" element={<TelegramWalletPage />} />
                <Route path="wallet/demo" element={<WalletDemoPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="superadmin" element={<SuperAdminPage />} />
              </Route>
            </Routes>
          </Router>
        </AppThemeProvider>
      </UserProvider>
    </FirebaseProvider>
  );
}

export default App;
