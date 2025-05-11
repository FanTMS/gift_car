import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button, alpha, useTheme, CircularProgress, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFirebase } from '../../context/FirebaseContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import TonConnectService from '../../services/TonConnectService';

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

interface TonConnectComponentProps {
  onSuccessConnect?: (walletAddress: string) => void;
  onError?: (error: string) => void;
}

const tonLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzAzODhDQyIvPgo8cGF0aCBkPSJNMTYuNjA5MSAxOS41ODIzTDI1LjEyNTIgMTYuMDIzOUwyMS45Njc1IDI0LjIzMDVMMTYuNjA5MSAxOS41ODIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyMkwyMC43NzAzIDEzLjMwNDdMMjUuMTI1MSAxNi4wMjM5TDE2LjYwOTEgMTkuNTgyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMy45MTAyIDI2LjA4NjNMMTYuNjA5MSAxOS41ODIzTDIxLjk2NzUgMjQuMjMwNUwxMy45MTAyIDI2LjA4NjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTMuOTEwMiAyNi4wODYzTDEzLjc3NzMgMTguMjg5NkwxNi42MDkxIDE5LjU4MjNMMTMuOTEwMiAyNi4wODYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyM0wxMy43NzczIDE4LjI4OTZMMjAuNzcwMyAxMy4zMDQ3TDE2LjYwOTEgMTkuNTgyM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

const TonConnectComponent: React.FC<TonConnectComponentProps> = ({ onSuccessConnect, onError }) => {
  const theme = useTheme();
  const { user, refreshData } = useFirebase();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  
  // Ссылка на экземпляр TonConnectService
  const tonConnectServiceRef = useRef<TonConnectService | null>(null);
  
  // Получаем экземпляр TonConnectService
  const getTonConnectService = (): TonConnectService => {
    if (!tonConnectServiceRef.current) {
      tonConnectServiceRef.current = TonConnectService.getInstance();
    }
    return tonConnectServiceRef.current;
  };
  
  // Инициализируем связь с TonConnect при монтировании компонента
  useEffect(() => {
    try {
      // Получаем экземпляр сервиса
      const tonConnectService = getTonConnectService();
      
      // Инициализируем TonConnect
      tonConnectService.getTonConnect();
    } catch (initError) {
      console.error('Error initializing TonConnect in component:', initError);
      setError('Ошибка инициализации TonConnect');
      setShowError(true);
      if (onError) onError('Ошибка инициализации TonConnect');
    }
  }, [onError]);
  
  // Обрабатываем изменения состояния подключения
  useEffect(() => {
    try {
      const tonConnectService = getTonConnectService();
      
      const unsubscribe = tonConnectService.onStatusChange((wallet) => {
        console.log('TonConnect status changed:', wallet);
        setIsConnecting(false);
        
        if (wallet && user) {
          // Если кошелек подключен и есть пользователь, сохраняем TON адрес
          const walletAddress = wallet.account.address;
          console.log('TON wallet connected:', walletAddress);
          
          try {
            // Привязываем TON адрес к пользователю
            const userDocRef = doc(db, 'users', user.uid);
            
            updateDoc(userDocRef, {
              tonWalletAddress: walletAddress,
              updatedAt: Timestamp.now()
            }).then(() => {
              // Обновляем данные в Firebase
              refreshData();
              
              // Вызываем callback при успешном подключении
              if (onSuccessConnect) onSuccessConnect(walletAddress);
            }).catch((error) => {
              console.error('Error saving TON wallet address:', error);
              setError('Ошибка при сохранении адреса TON кошелька');
              setShowError(true);
              if (onError) onError('Ошибка при сохранении адреса TON кошелька');
            });
          } catch (error) {
            console.error('Error connecting TON wallet:', error);
            setError('Ошибка при подключении TON кошелька');
            setShowError(true);
            if (onError) onError('Ошибка при подключении TON кошелька');
          }
        }
      });
      
      // Отписка при размонтировании или смене зависимостей
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from TonConnect:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up TonConnect status listener:', error);
      setError('Ошибка при настройке прослушивателя статуса TonConnect');
      setShowError(true);
    }
  }, [user, refreshData, onSuccessConnect, onError]);
  
  const handleConnectWallet = async () => {
    try {
      if (!user) {
        setError('Необходимо авторизоваться для привязки кошелька');
        setShowError(true);
        if (onError) onError('Необходимо авторизоваться для привязки кошелька');
        return;
      }
      
      console.log('Opening TonConnect modal');
      setIsConnecting(true);
      
      const tonConnectService = getTonConnectService();
      
      // Отключаем предыдущее соединение, если есть
      if (tonConnectService.isConnected()) {
        await tonConnectService.disconnect();
      }
      
      // Открываем модальное окно выбора кошелька
      await tonConnectService.openModal();
    } catch (error) {
      console.error('Error opening TonConnect modal:', error);
      setIsConnecting(false);
      setError('Ошибка при открытии окна подключения TON кошелька');
      setShowError(true);
      if (onError) onError('Ошибка при открытии окна подключения TON кошелька');
    }
  };
  
  // Обработка закрытия уведомления об ошибке
  const handleCloseError = () => {
    setShowError(false);
  };
  
  return (
    <>
      <ConnectCard>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Подключите TON кошелек
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Используйте TonConnect для безопасного подключения вашего TON кошелька. 
          Поддерживаются кошельки Tonkeeper, Bitget Wallet и другие.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            sx={{ 
              borderRadius: theme.spacing(3),
              padding: theme.spacing(1.5, 3),
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            {isConnecting ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Подключение...
              </Box>
            ) : (
              'Подключить TON кошелек'
            )}
          </Button>
        </Box>
      </ConnectCard>
      
      {/* Уведомление об ошибке */}
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TonConnectComponent; 