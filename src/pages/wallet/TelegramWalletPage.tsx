import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, useTheme, alpha, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import TonConnectComponent from '../../components/wallet/TonConnectComponent';
import DevSuperAdminPanel from '../../components/admin/DevSuperAdminPanel';
import { motion } from 'framer-motion';
import { useFirebase } from '../../context/FirebaseContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TelegramWalletPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, appSettings, loading, refreshData } = useFirebase();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState<boolean>(false);
  const [callbackSuccess, setCallbackSuccess] = useState<boolean>(false);
  
  // Получаем настройки для кошелька Telegram
  const telegramWallet = appSettings?.telegramWallet;
  const isEnabled = telegramWallet?.enabled || false;

  // Обрабатываем параметры URL для случая возврата с TON кошельком
  useEffect(() => {
    const processCallbackParams = async () => {
      try {
        // Получаем параметры из URL
        const urlParams = new URLSearchParams(location.search);
        const tonAddress = urlParams.get('address');
        const tonData = urlParams.get('data');
        
        // Если есть адрес TON в параметрах и авторизованный пользователь
        if (tonAddress && user) {
          console.log('TON callback detected with address:', tonAddress);
          setIsProcessingCallback(true);
          
          // Получаем данные из Telegram WebApp
          const telegramData = getTelegramUser();
          
          // Привязываем TON адрес к пользователю
          const userDocRef = doc(db, 'users', user.uid);
          
          await updateDoc(userDocRef, {
            tonWalletAddress: tonAddress,
            telegramId: telegramData?.id,
            telegramUsername: telegramData?.username,
            updatedAt: Timestamp.now()
          });
          
          // Создаем транзакцию для записи события
          const transaction = {
            userId: user.uid,
            amount: 0,
            type: 'system',
            status: 'completed',
            description: 'Подключение кошелька TON',
            paymentMethod: 'ton_wallet',
            createdAt: Timestamp.now(),
            completedAt: Timestamp.now(),
            metadata: {
              operation: 'wallet_connect',
              telegramId: telegramData?.id,
              telegramUsername: telegramData?.username,
              tonWalletAddress: tonAddress,
              tonData: tonData
            }
          };
          
          // Обновляем данные в Firebase
          refreshData();
          
          // Устанавливаем флаг успешного подключения
          setCallbackSuccess(true);
          
          // Перенаправляем на страницу кошелька
          setTimeout(() => {
            navigate('/wallet', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing TON callback:', error);
        setConnectError('Ошибка при обработке данных TON кошелька');
      } finally {
        setIsProcessingCallback(false);
      }
    };
    
    processCallbackParams();
  }, [location, user]);

  // Функция для получения данных пользователя Telegram
  const getTelegramUser = () => {
    try {
      if (
        window.Telegram &&
        window.Telegram.WebApp &&
        (window.Telegram.WebApp as any).initDataUnsafe &&
        (window.Telegram.WebApp as any).initDataUnsafe.user
      ) {
        return (window.Telegram.WebApp as any).initDataUnsafe.user;
      }
    } catch (e) {
      console.error('Error getting Telegram data:', e);
    }
    return null;
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleTonWalletConnect = (walletAddress: string) => {
    console.log('TON wallet connected successfully:', walletAddress);
    // Перенаправление на страницу кошелька после успешной привязки
    setTimeout(() => {
      navigate('/wallet');
    }, 2000);
  };
  
  const handleError = (error: string) => {
    setConnectError(error);
  };

  if (loading || isProcessingCallback) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {isProcessingCallback ? 'Обрабатываем подключение кошелька...' : 'Загрузка...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (callbackSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ 
          py: 5, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                textAlign: 'center',
                maxWidth: 400
              }}
            >
              <Typography variant="h6" color="success.main" gutterBottom>
                Кошелек успешно подключен!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Перенаправляем вас на страницу кошелька...
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        py: 3, 
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Назад
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Привязка TON кошелька
          </Typography>
        </Box>
        
        {/* Компонент для активации режима суперадминистратора (только в development) */}
        <DevSuperAdminPanel />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box 
            sx={{ 
              p: 2, 
              mb: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.07),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Подключите TON кошелек для быстрых и безопасных транзакций. 
              С помощью TON кошелька вы сможете участвовать в розыгрышах призов и пополнять баланс.
            </Typography>
          </Box>
        </motion.div>

        {!isEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              sx={{ 
                p: 2, 
                mb: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.07),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Функция кошелька TON в настоящее время отключена администратором. 
                Пожалуйста, попробуйте позже или свяжитесь с поддержкой.
              </Typography>
            </Box>
          </motion.div>
        )}

        <TonConnectComponent 
          onSuccessConnect={handleTonWalletConnect}
          onError={handleError}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center"
          sx={{ mt: 4 }}
        >
          При привязке кошелька вы соглашаетесь с условиями использования сервиса
        </Typography>
      </Box>
    </Container>
  );
};

export default TelegramWalletPage; 