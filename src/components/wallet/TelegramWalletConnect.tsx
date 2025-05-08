import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  alpha,
  useTheme,
  Dialog,
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Link as LinkIcon,
  Close,
  Telegram,
  AccountBalanceWallet,
  Security,
  Speed,
  Check,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFirebase } from '../../context/FirebaseContext';
import { findUserByTelegramId, updateUserProfile } from '../../firebase/userServices';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Стилизованные компоненты
const ConnectCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  maxWidth: 400,
  margin: '0 auto'
}));

const WalletHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ConnectButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  marginTop: theme.spacing(3),
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
  }
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const BackgroundCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-80px',
  right: '-80px',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: alpha(theme.palette.primary.main, 0.05),
  zIndex: 0,
}));

const BackgroundCircleSmall = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-40px',
  left: '10%',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: alpha(theme.palette.primary.main, 0.03),
  zIndex: 0,
}));

// Получение Telegram WebApp данных
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

interface TelegramWalletConnectProps {
  onSuccessConnect?: () => void;
  onError?: (error: string) => void;
}

const TelegramWalletConnect: React.FC<TelegramWalletConnectProps> = ({ onSuccessConnect, onError }) => {
  const theme = useTheme();
  const { user, appSettings, refreshData } = useFirebase();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramData, setTelegramData] = useState<any>(null);
  
  // Проверяем настройки для Telegram кошелька
  const isTelegramWalletEnabled = appSettings?.telegramWallet?.enabled || false;
  const botUsername = appSettings?.telegramWallet?.botUsername || '';
  
  // Получаем данные из Telegram WebApp при загрузке
  useEffect(() => {
    const tgUser = getTelegramUser();
    if (tgUser) {
      setTelegramData(tgUser);
      // Проверяем, был ли этот Telegram ID уже привязан к пользователю
      checkTelegramConnection(tgUser.id);
    }
  }, [user]);
  
  // Проверяем, есть ли уже привязка к Telegram
  const checkTelegramConnection = async (telegramId: string) => {
    try {
      // Проверяем есть ли у текущего пользователя telegramId
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userData = await findUserByTelegramId(telegramId);
        
        if (userData && userData.id === user.uid) {
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Error checking Telegram connection:', err);
    }
  };

  const handleConnectWallet = async () => {
    if (!user) {
      setError('Необходимо авторизоваться для привязки кошелька');
      if (onError) onError('Необходимо авторизоваться для привязки кошелька');
      return;
    }
    
    if (!isTelegramWalletEnabled) {
      setError('Функция кошелька Telegram отключена администратором');
      if (onError) onError('Функция кошелька Telegram отключена администратором');
      return;
    }
    
    if (!telegramData) {
      // Если нет данных Telegram, открываем бота или перенаправляем
      window.open(`https://t.me/${botUsername}`, '_blank');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Привязываем Telegram ID к пользователю
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        telegramId: telegramData.id,
        telegramUsername: telegramData.username,
        updatedAt: Timestamp.now()
      });
      
      // Создаем транзакцию для записи события
      const transaction = {
        userId: user.uid,
        amount: 0,
        type: 'system',
        status: 'completed',
        description: 'Подключение кошелька Telegram',
        paymentMethod: 'telegram_wallet',
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        metadata: {
          operation: 'wallet_connect',
          telegramId: telegramData.id,
          telegramUsername: telegramData.username
        }
      };
      
      // Обновляем состояние
      setIsConnected(true);
      
      // Обновляем данные в Firebase
      refreshData();
      
      // Вызываем callback при успешном подключении
      if (onSuccessConnect) onSuccessConnect();
      
    } catch (err) {
      console.error('Error connecting Telegram wallet:', err);
      setError('Ошибка при привязке кошелька Telegram. Пожалуйста, попробуйте позже.');
      if (onError) onError('Ошибка при привязке кошелька Telegram');
    } finally {
      setIsConnecting(false);
    }
  };

  // Компонент для отображения статуса подключения
  const ConnectionStatus = () => {
    if (isConnected) {
      return (
        <Alert 
          icon={<Check fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 2 }}
        >
          Кошелек Telegram успешно привязан к вашему аккаунту!
        </Alert>
      );
    }
    
    if (error) {
      return (
        <Alert 
          icon={<ErrorIcon fontSize="inherit" />} 
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ConnectCard>
        <BackgroundCircle />
        <BackgroundCircleSmall />
        
        <WalletHeader>
          <LogoIcon>
            <AccountBalanceWallet sx={{ fontSize: 22 }} />
          </LogoIcon>
          <Typography variant="h5" fontWeight={700}>
            Кошелек
          </Typography>
        </WalletHeader>
        
        <ConnectionStatus />
        
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {isConnected ? 'Ваш кошелек Telegram подключен' : 'Привяжите кошелек Telegram'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isConnected 
            ? 'Теперь вы можете использовать кошелек Telegram для быстрых транзакций и управления средствами.' 
            : 'Подключите ваш кошелек Telegram для быстрых и удобных транзакций внутри нашей системы.'}
        </Typography>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <FeatureItem>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
              <Security sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Безопасные транзакции
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Защита средств на всех этапах
              </Typography>
            </Box>
          </FeatureItem>
          
          <FeatureItem>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
              <Speed sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Мгновенные переводы
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Моментальное пополнение баланса
              </Typography>
            </Box>
          </FeatureItem>
          
          <FeatureItem>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
              <LinkIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Единый аккаунт
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Используйте один аккаунт для всех операций
              </Typography>
            </Box>
          </FeatureItem>
        </Box>
        
        {!isConnected && (
          <ConnectButton
            fullWidth
            variant="contained"
            color="primary"
            startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <Telegram />}
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Подключение...' : 'Привязать кошелек Telegram'}
          </ConnectButton>
        )}
        
        {isConnected && (
          <ConnectButton
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<Telegram />}
            onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
          >
            Открыть кошелек в Telegram
          </ConnectButton>
        )}
      </ConnectCard>
    </motion.div>
  );
};

export default TelegramWalletConnect; 