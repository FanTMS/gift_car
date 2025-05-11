import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowBack } from '@mui/icons-material';

// Стилизованные компоненты
const PaymentContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 550,
  margin: '0 auto',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const PaymentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const PaymentLogo = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  '& svg': {
    color: theme.palette.common.white,
    fontSize: 24,
  }
}));

// Функция для форматирования даты из Timestamp
const formatFirebaseDate = (date: any): string => {
  if (!date) return '';
  
  // Если это объект Timestamp с полями seconds и nanoseconds
  if (date.seconds && date.nanoseconds) {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }
  
  // Если это Date
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  
  // Если это строка или число
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date).toLocaleDateString();
  }
  
  return '';
};

const PaymentEmulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Получаем данные из URL
  const orderId = queryParams.get('orderId');
  const amount = queryParams.get('amount');
  const description = queryParams.get('description');
  const returnUrl = queryParams.get('returnUrl');
  
  // Данные формы
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiryDate, setCardExpiryDate] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  
  useEffect(() => {
    // Если не переданы необходимые параметры, перенаправляем на главную
    if (!orderId || !amount || !returnUrl) {
      navigate('/');
    }
  }, [orderId, amount, returnUrl, navigate]);
  
  // Обработка оплаты
  const handlePayment = () => {
    // Валидация данных карты
    if (!validateCardData()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Эмулируем обработку платежа
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Эмулируем перенаправление обратно через 2 секунды
      setTimeout(() => {
        if (returnUrl) {
          window.location.href = returnUrl + '&status=success';
        } else {
          navigate('/');
        }
      }, 2000);
    }, 2000);
  };
  
  // Валидация данных карты
  const validateCardData = (): boolean => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Введите корректный номер карты из 16 цифр');
      return false;
    }
    
    if (!cardExpiryDate.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiryDate)) {
      setError('Введите корректную дату в формате ММ/ГГ');
      return false;
    }
    
    if (!cardCvv.trim() || !/^\d{3}$/.test(cardCvv)) {
      setError('Введите корректный CVV-код из 3 цифр');
      return false;
    }
    
    if (!cardHolder.trim()) {
      setError('Введите имя владельца карты');
      return false;
    }
    
    return true;
  };
  
  // Форматирование номера карты
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Форматирование даты истечения срока
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  // Обработчики изменения полей формы
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiryDate(formatExpiryDate(e.target.value));
  };
  
  // Если страница загружается, но данные еще не обработаны
  if (!orderId || !amount || !returnUrl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (success) {
    return (
      <Box sx={{ padding: 4 }}>
        <PaymentContainer>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Платеж успешно выполнен!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Заказ №{orderId} обработан
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Перенаправление на страницу результата...
            </Typography>
          </Box>
        </PaymentContainer>
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 600, margin: '0 auto', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}
        >
          Назад к розыгрышу
        </Button>
      </Box>
      
      <PaymentContainer>
        <PaymentHeader>
          <PaymentLogo>
            <CreditCard />
          </PaymentLogo>
          <Typography variant="h5" fontWeight={600}>
            Оплата заказа
          </Typography>
        </PaymentHeader>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description || 'Покупка билетов на розыгрыш'}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3, 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 2 
        }}>
          <Typography variant="subtitle1">Сумма к оплате:</Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {Number(amount).toLocaleString()} ₽
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Данные банковской карты
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Номер карты"
            value={cardNumber}
            onChange={handleCardNumberChange}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="0000 0000 0000 0000"
            inputProps={{ maxLength: 19 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="ММ/ГГ"
              value={cardExpiryDate}
              onChange={handleExpiryDateChange}
              margin="normal"
              variant="outlined"
              placeholder="MM/YY"
              inputProps={{ maxLength: 5 }}
              sx={{ flex: 1 }}
            />
            
            <TextField
              label="CVV"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              margin="normal"
              variant="outlined"
              placeholder="123"
              type="password"
              inputProps={{ maxLength: 3 }}
              sx={{ flex: 1 }}
            />
          </Box>
          
          <TextField
            label="Имя владельца карты"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="IVAN IVANOV"
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Тестовый режим. Для эмуляции успешной оплаты введите любые данные и нажмите "Оплатить".
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handlePayment}
          disabled={loading}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Оплатить ${Number(amount).toLocaleString()} ₽`
          )}
        </Button>
      </PaymentContainer>
    </Box>
  );
};

export default PaymentEmulatorPage; 