import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Payment,
  CreditCard,
  Close,
  CurrencyRuble,
  Bolt
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFirebase } from '../../context/FirebaseContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const PaymentMethodCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `2px solid transparent`,
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const WalletTopUp: React.FC = () => {
  const theme = useTheme();
  const { user, getUserBalance, createTransaction, updateUserBalance } = useFirebase();
  const [amount, setAmount] = useState<string>('500');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Предустановленные суммы для быстрого выбора
  const presetAmounts = [100, 500, 1000, 2000, 5000];

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (user) {
      loadUserBalance();
      loadPaymentSettings();
    }
  }, [user]);

  // Загрузка баланса пользователя
  const loadUserBalance = async () => {
    if (!user) return;
    
    try {
      const userBalance = await getUserBalance(user.uid);
      setBalance(userBalance);
    } catch (error) {
      console.error('Ошибка при загрузке баланса:', error);
      setError('Не удалось загрузить баланс');
    }
  };

  // Загрузка настроек платежных систем
  const loadPaymentSettings = async () => {
    try {
      setLoadingSettings(true);
      const settingsDoc = doc(db, 'settings', 'payments');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPaymentSettings(data);
        
        // Формирование списка доступных платежных методов
        const methods = [];
        
        if (data.yoomoney?.enabled) {
          methods.push({
            id: 'yoomoney',
            name: 'ЮKassa (Банковские карты)',
            icon: <CreditCard />,
            description: 'Оплата банковской картой Visa, Mastercard, МИР'
          });
        }
        
        if (data.ton?.enabled) {
          methods.push({
            id: 'ton',
            name: 'TON',
            icon: <Bolt />,
            description: 'Оплата криптовалютой TON'
          });
        }
        
        setPaymentMethods(methods);
        
        // Установка первого метода по умолчанию, если есть доступные методы
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек платежных систем:', error);
      setError('Не удалось загрузить настройки платежей');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Обработчик изменения суммы
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Обработчик выбора предустановленной суммы
  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  // Обработчик выбора платежного метода
  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  // Обработчик открытия диалога оплаты
  const handleOpenPaymentDialog = () => {
    // Валидация суммы перед открытием диалога
    const numAmount = Number(amount);
    
    if (!numAmount || numAmount <= 0) {
      setError('Введите корректную сумму пополнения');
      return;
    }
    
    if (paymentSettings) {
      const { minPayment, maxPayment } = paymentSettings;
      
      if (numAmount < minPayment) {
        setError(`Минимальная сумма пополнения: ${minPayment} ₽`);
        return;
      }
      
      if (numAmount > maxPayment) {
        setError(`Максимальная сумма пополнения: ${maxPayment} ₽`);
        return;
      }
    }
    
    if (!selectedMethod) {
      setError('Выберите способ оплаты');
      return;
    }
    
    setError(null);
    setPaymentDialogOpen(true);
  };

  // Обработчик закрытия диалога оплаты
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };

  // Обработчик совершения платежа
  const handlePayment = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const numAmount = Number(amount);
      
      // В тестовом режиме просто добавляем средства на счет
      if (paymentSettings?.testMode) {
        // Создаем транзакцию
        await createTransaction({
          userId: user.uid,
          amount: numAmount,
          status: 'completed',
          description: 'Пополнение баланса (тестовый режим)',
          type: 'deposit',
          createdAt: new Date()
        });
        
        // Обновляем баланс пользователя
        await updateUserBalance(user.uid, numAmount, 'add');
        
        // Обновляем локальные данные
        setBalance((prev) => (prev !== null ? prev + numAmount : numAmount));
        setSuccess(`Баланс успешно пополнен на ${numAmount} ₽ (тестовый режим)`);
        handleClosePaymentDialog();
        
        // Сбрасываем сообщение об успехе через некоторое время
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        // В реальном режиме перенаправляем на страницу оплаты в зависимости от выбранного метода
        if (selectedMethod === 'yoomoney') {
          // Здесь будет реализация для ЮMoney
          alert('Функционал будет реализован позже');
        } else if (selectedMethod === 'ton') {
          // Здесь будет реализация для TON
          alert('Функционал будет реализован позже');
        }
      }
    } catch (error) {
      console.error('Ошибка при выполнении платежа:', error);
      setError('Не удалось выполнить платеж');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountBalanceWallet color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight={600}>
          Пополнение баланса
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {balance !== null && (
        <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
          <Typography variant="body1">
            Текущий баланс: <strong>{balance.toLocaleString('ru-RU')} ₽</strong>
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
          Сумма пополнения
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={amount}
          onChange={handleAmountChange}
          InputProps={{
            startAdornment: <CurrencyRuble sx={{ mr: 1, color: 'text.secondary' }} />,
            inputProps: { min: 0 }
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {presetAmounts.map((presetAmount) => (
            <Button
              key={presetAmount}
              variant={Number(amount) === presetAmount ? "contained" : "outlined"}
              onClick={() => handlePresetAmount(presetAmount)}
              size="small"
            >
              {presetAmount} ₽
            </Button>
          ))}
        </Box>
      </Box>
      
      {loadingSettings ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : paymentMethods.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
            Способ оплаты
          </Typography>
          
          <Stack spacing={2}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard 
                key={method.id}
                selected={selectedMethod === method.id}
                onClick={() => handleSelectPaymentMethod(method.id)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {method.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </Box>
                </CardContent>
              </PaymentMethodCard>
            ))}
          </Stack>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          В данный момент платежные методы недоступны. Пожалуйста, обратитесь к администратору.
        </Alert>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Payment />}
          fullWidth
          onClick={handleOpenPaymentDialog}
          disabled={loading || loadingSettings || paymentMethods.length === 0 || !amount}
        >
          Пополнить баланс
        </Button>
      </Box>
      
      {/* Диалог подтверждения оплаты */}
      <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Подтверждение платежа
            <IconButton edge="end" onClick={handleClosePaymentDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Сумма к оплате: <strong>{Number(amount).toLocaleString('ru-RU')} ₽</strong>
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Способ оплаты:
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
              {paymentMethods.find(m => m.id === selectedMethod)?.name || 'Не выбран'}
            </Box>
          </Box>
          
          {paymentSettings?.testMode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Система работает в тестовом режиме. Реального списания средств не произойдет.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handlePayment} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Обработка...' : 'Оплатить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WalletTopUp;