import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Error as ErrorIcon, ArrowBack } from '@mui/icons-material';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Получаем параметры из URL
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  
  useEffect(() => {
    // Проверяем результат платежа
    const checkPaymentResult = async () => {
      try {
        // Здесь должен быть код для проверки статуса платежа
        // В данном примере мы имитируем успешную оплату через задержку
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Здесь можно обращаться к базе данных или API для проверки платежа
        // В этом примере просто считаем, что платеж успешный
        setSuccess(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking payment result:', error);
        setError('Не удалось проверить статус платежа');
        setSuccess(false);
        setLoading(false);
      }
    };
    
    if (orderId || paymentId) {
      checkPaymentResult();
    } else {
      setError('Отсутствуют параметры платежа');
      setLoading(false);
    }
  }, [orderId, paymentId]);
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handleViewTickets = () => {
    navigate('/profile/tickets');
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '70vh',
          p: 3
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" textAlign="center">
          Проверяем статус платежа...
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
          Это может занять некоторое время
        </Typography>
      </Box>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {success ? (
            <>
              <CheckCircle 
                color="success" 
                sx={{ 
                  fontSize: 80,
                  mb: 2
                }} 
              />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Платеж успешно выполнен!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Ваш билет на розыгрыш был успешно оплачен. Информация о билете доступна в личном кабинете.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={handleViewTickets}
                >
                  Посмотреть мои билеты
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBackToHome}
                >
                  Вернуться на главную
                </Button>
              </Box>
            </>
          ) : (
            <>
              <ErrorIcon 
                color="error" 
                sx={{ 
                  fontSize: 80,
                  mb: 2
                }} 
              />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Ошибка при оплате
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {error || 'Произошла ошибка при обработке платежа. Попробуйте еще раз или выберите другой способ оплаты.'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={() => navigate(-1)}
                >
                  Попробовать снова
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBackToHome}
                >
                  Вернуться на главную
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
};

export default PaymentResultPage; 