import React, { useState } from 'react';
import { Container, Box, Typography, Button, useTheme, alpha, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TelegramWalletConnect from '../../components/wallet/TelegramWalletConnect';
import DevSuperAdminPanel from '../../components/admin/DevSuperAdminPanel';
import { motion } from 'framer-motion';
import { useFirebase } from '../../context/FirebaseContext';

const TelegramWalletPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { appSettings, loading } = useFirebase();
  const [connectError, setConnectError] = useState<string | null>(null);
  
  // Получаем настройки для кошелька Telegram
  const telegramWallet = appSettings?.telegramWallet;
  const isEnabled = telegramWallet?.enabled || false;

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleSuccessConnect = () => {
    // Перенаправление на страницу кошелька после успешной привязки
    setTimeout(() => {
      navigate('/wallet');
    }, 2000);
  };
  
  const handleError = (error: string) => {
    setConnectError(error);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
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
            Привязка кошелька
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
              Привязав кошелек Telegram, вы сможете быстро пополнять баланс и участвовать в розыгрышах призов.
              Все транзакции защищены и проходят в безопасном режиме.
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
                Функция кошелька Telegram в настоящее время отключена администратором. 
                Пожалуйста, попробуйте позже или свяжитесь с поддержкой.
              </Typography>
            </Box>
          </motion.div>
        )}

        <TelegramWalletConnect 
          onSuccessConnect={handleSuccessConnect}
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