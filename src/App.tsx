import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { UserProvider, useUser } from './context/UserContext';
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
import RegistrationDialog from './components/auth/RegistrationDialog';

// Компонент для обязательной регистрации
const RequireRegistration: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isRegistered } = useUser();
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    if (!loading && user && !isRegistered) {
      setShowRegistration(true);
    } else {
      setShowRegistration(false);
    }
  }, [user, profile, loading, isRegistered]);

  const handleCloseRegistration = () => {
    // Мы не закрываем диалог, если пользователь не прошел регистрацию
    // Регистрация закроется автоматически после успешного завершения
  };

  if (loading) {
    return null; // Показываем прелоадер или ничего во время загрузки
  }

  return (
    <>
      {children}
      <RegistrationDialog 
        open={showRegistration} 
        onClose={handleCloseRegistration} 
      />
    </>
  );
};

// Компонент для оборачивания всего содержимого приложения
const AppContent: React.FC = () => {
  return (
    <RequireRegistration>
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
    </RequireRegistration>
  );
};

function App() {
  useEffect(() => {
    // Разрешаем прокрутку на десктопной версии
    if (window.innerWidth > 768) {
      document.body.style.overflow = 'auto';
    }

    // Инициализация и настройка Telegram Mini App
    initializeTelegramApp();
    applyTelegramStyles();
  }, []);

  return (
    <FirebaseProvider>
      <UserProvider>
        <AppThemeProvider>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </AppThemeProvider>
      </UserProvider>
    </FirebaseProvider>
  );
}

export default App;
