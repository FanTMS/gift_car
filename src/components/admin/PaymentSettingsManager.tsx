import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Save,
  CreditCard,
  Info,
  Refresh
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const SettingsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const PaymentSettingsManager: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // YooMoney настройки
  const [yoomoneyEnabled, setYoomoneyEnabled] = useState(false);
  const [yoomoneyShopId, setYoomoneyShopId] = useState('');
  const [yoomoneySecretKey, setYoomoneySecretKey] = useState('');
  const [yoomoneyReturnUrl, setYoomoneyReturnUrl] = useState('');
  
  // TON настройки
  const [tonEnabled, setTonEnabled] = useState(false);
  const [tonApiKey, setTonApiKey] = useState('');
  const [tonWalletAddress, setTonWalletAddress] = useState('');
  
  // Другие общие настройки
  const [minPayment, setMinPayment] = useState('100');
  const [maxPayment, setMaxPayment] = useState('100000');
  const [testMode, setTestMode] = useState(false);
  
  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Функция загрузки настроек из базы данных
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Получение документа с настройками платежных систем
      const settingsDoc = doc(db, 'settings', 'payments');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // YooMoney настройки
        if (data.yoomoney) {
          setYoomoneyEnabled(data.yoomoney.enabled || false);
          setYoomoneyShopId(data.yoomoney.shopId || '');
          setYoomoneySecretKey(data.yoomoney.secretKey || '');
          setYoomoneyReturnUrl(data.yoomoney.returnUrl || '');
        }
        
        // TON настройки
        if (data.ton) {
          setTonEnabled(data.ton.enabled || false);
          setTonApiKey(data.ton.apiKey || '');
          setTonWalletAddress(data.ton.walletAddress || '');
        }
        
        // Общие настройки
        setMinPayment(data.minPayment?.toString() || '100');
        setMaxPayment(data.maxPayment?.toString() || '100000');
        setTestMode(data.testMode || false);
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек платежных систем:', error);
      setNotification({
        open: true,
        message: 'Ошибка при загрузке настроек',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция сохранения настроек
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Валидация данных
      const minPaymentValue = parseInt(minPayment);
      const maxPaymentValue = parseInt(maxPayment);
      
      if (isNaN(minPaymentValue) || isNaN(maxPaymentValue)) {
        setNotification({
          open: true,
          message: 'Минимальная и максимальная сумма должны быть числами',
          severity: 'error'
        });
        return;
      }
      
      if (minPaymentValue <= 0 || maxPaymentValue <= 0) {
        setNotification({
          open: true,
          message: 'Суммы должны быть положительными числами',
          severity: 'error'
        });
        return;
      }
      
      if (minPaymentValue >= maxPaymentValue) {
        setNotification({
          open: true,
          message: 'Минимальная сумма должна быть меньше максимальной',
          severity: 'error'
        });
        return;
      }
      
      // Формирование данных для сохранения
      const paymentSettings = {
        yoomoney: {
          enabled: yoomoneyEnabled,
          shopId: yoomoneyShopId,
          secretKey: yoomoneySecretKey,
          returnUrl: yoomoneyReturnUrl
        },
        ton: {
          enabled: tonEnabled,
          apiKey: tonApiKey,
          walletAddress: tonWalletAddress
        },
        minPayment: minPaymentValue,
        maxPayment: maxPaymentValue,
        testMode: testMode,
        updatedAt: Timestamp.now()
      };
      
      // Получение документа с настройками
      const settingsDocRef = doc(db, 'settings', 'payments');
      const docSnap = await getDoc(settingsDocRef);
      
      if (docSnap.exists()) {
        // Обновление существующего документа
        await updateDoc(settingsDocRef, paymentSettings);
      } else {
        // Создание нового документа
        await setDoc(settingsDocRef, {
          ...paymentSettings,
          createdAt: Timestamp.now()
        });
      }
      
      setNotification({
        open: true,
        message: 'Настройки успешно сохранены',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при сохранении настроек платежных систем:', error);
      setNotification({
        open: true,
        message: 'Ошибка при сохранении настроек',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Настройки платежных систем
        </Typography>
        <Tooltip title="Обновить данные">
          <IconButton color="primary" onClick={loadSettings} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <SettingsCard>
        <CardHeader 
          title="Общие настройки" 
          subheader="Параметры, действующие для всех платежных систем"
          avatar={<CreditCard color="primary" />}
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' } }}>
              <TextField
                fullWidth
                label="Минимальная сумма платежа (₽)"
                variant="outlined"
                type="number"
                value={minPayment}
                onChange={(e) => setMinPayment(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' } }}>
              <TextField
                fullWidth
                label="Максимальная сумма платежа (₽)"
                variant="outlined"
                type="number"
                value={maxPayment}
                onChange={(e) => setMaxPayment(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Тестовый режим"
              />
              <Typography variant="caption" color="textSecondary">
                В тестовом режиме не происходит реальных списаний
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </SettingsCard>
      
      <SettingsCard>
        <CardHeader 
          title="YooMoney (ЮKassa)" 
          subheader="Настройки платежной системы ЮKassa"
          avatar={<CreditCard color="primary" />}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={yoomoneyEnabled}
                  onChange={(e) => setYoomoneyEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={yoomoneyEnabled ? "Включено" : "Выключено"}
            />
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ opacity: yoomoneyEnabled ? 1 : 0.5, pointerEvents: yoomoneyEnabled ? 'auto' : 'none' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  label="ID магазина"
                  variant="outlined"
                  value={yoomoneyShopId}
                  onChange={(e) => setYoomoneyShopId(e.target.value)}
                  helperText="Идентификатор магазина в системе ЮKassa"
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  label="Секретный ключ"
                  variant="outlined"
                  type="password"
                  value={yoomoneySecretKey}
                  onChange={(e) => setYoomoneySecretKey(e.target.value)}
                  helperText="Секретный ключ для проверки подписи уведомлений"
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="URL для возврата после оплаты"
                  variant="outlined"
                  value={yoomoneyReturnUrl}
                  onChange={(e) => setYoomoneyReturnUrl(e.target.value)}
                  helperText="URL, на который будет перенаправлен пользователь после оплаты"
                  margin="normal"
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                Настройка уведомлений (вебхуков)
              </Typography>
              <Typography variant="body2">
                Для уведомлений о платежах, в настройках магазина ЮKassa необходимо указать следующий URL:
              </Typography>
              <Box sx={{ p: 1, mt: 1, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="body2" fontFamily="monospace">
                  https://your-app-domain.ru/api/payment/webhook/yoomoney
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </SettingsCard>
      
      <SettingsCard>
        <CardHeader 
          title="TON" 
          subheader="Настройки платежной системы TON"
          avatar={<CreditCard color="primary" />}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={tonEnabled}
                  onChange={(e) => setTonEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={tonEnabled ? "Включено" : "Выключено"}
            />
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ opacity: tonEnabled ? 1 : 0.5, pointerEvents: tonEnabled ? 'auto' : 'none' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  label="API ключ"
                  variant="outlined"
                  value={tonApiKey}
                  onChange={(e) => setTonApiKey(e.target.value)}
                  helperText="API ключ для взаимодействия с TON API"
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                <TextField
                  fullWidth
                  label="Адрес кошелька TON"
                  variant="outlined"
                  value={tonWalletAddress}
                  onChange={(e) => setTonWalletAddress(e.target.value)}
                  helperText="Адрес кошелька для приема платежей"
                  margin="normal"
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                Инструкция по настройке
              </Typography>
              <Typography variant="body2">
                Для работы с TON необходимо:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2">
                    Создать кошелек в TON для приема платежей
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Получить API ключ в Telegram Bot API
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Указать эти данные в настройках выше
                  </Typography>
                </li>
              </ol>
            </Box>
          </Box>
        </CardContent>
      </SettingsCard>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={saveSettings}
          disabled={saving}
          size="large"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentSettingsManager; 