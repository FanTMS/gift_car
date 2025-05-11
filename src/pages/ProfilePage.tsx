import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CardGiftcard, 
  History, 
  Person,
  Settings,
  Login
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useUser } from '../context/UserContext';
import ActiveTickets from '../components/profile/ActiveTickets';
import TicketHistory from '../components/profile/TicketHistory';
import ModernProfileInfo from '../components/profile/ModernProfileInfo';
import EditProfileForm from '../components/profile/EditProfileForm';
import ModernProfileHeader from '../components/profile/ModernProfileHeader';
import ModernTabPanel from '../components/profile/ModernTabPanel';
import ModernTabs from '../components/profile/ModernTabs';
import { useIsMobile } from '../components/hooks/useMobile';
import { getAuth, signInAnonymously } from 'firebase/auth';
import TonConnectComponent from '../components/wallet/TonConnectComponent';
import TonConnectService from '../services/TonConnectService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Константа с base64 иконкой TON
const tonLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzAzODhDQyIvPgo8cGF0aCBkPSJNMTYuNjA5MSAxOS41ODIzTDI1LjEyNTIgMTYuMDIzOUwyMS45Njc1IDI0LjIzMDVMMTYuNjA5MSAxOS41ODIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyMkwyMC43NzAzIDEzLjMwNDdMMjUuMTI1MSAxNi4wMjM5TDE2LjYwOTEgMTkuNTgyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMy45MTAyIDI2LjA4NjNMMTYuNjA5MSAxOS41ODIzTDIxLjk2NzUgMjQuMjMwNUwxMy45MTAyIDI2LjA4NjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTMuOTEwMiAyNi4wODYzTDEzLjc3NzMgMTguMjg5NkwxNi42MDkxIDE5LjU4MjNMMTMuOTEwMiAyNi4wODYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyM0wxMy43NzczIDE4LjI4OTZMMjAuNzcwMyAxMy4zMDQ3TDE2LjYwOTEgMTkuNTgyM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

// Styled components for the page
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2, 8),
  }
}));

const ContentContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  [theme.breakpoints.up('md')]: {
    maxWidth: '800px',
  },
}));

const ErrorMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  marginTop: theme.spacing(2),
}));

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[3],
  textAlign: 'center',
}));

const TonWalletSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

// Функция для определения, запущено ли приложение в Telegram Mini App
const isTelegramMiniApp = (): boolean => {
  return Boolean(window.Telegram?.WebApp);
};

// Получение данных пользователя из Telegram Mini App
const getTelegramUserData = () => {
  try {
    if (window.Telegram?.WebApp && (window.Telegram.WebApp as any).initDataUnsafe?.user) {
      return (window.Telegram.WebApp as any).initDataUnsafe.user;
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя Telegram:', error);
  }
  return null;
};

const ProfilePage: React.FC = () => {
  const { user, profile, loading, error, refreshProfile } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tonWalletConnected, setTonWalletConnected] = useState(false);
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [tonWalletError, setTonWalletError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram
    const checkTelegram = isTelegramMiniApp();
    setIsTelegram(checkTelegram);
    
    if (checkTelegram) {
      // Инициализируем Telegram Mini App
      window.Telegram?.WebApp?.ready();
      
      // Получаем данные пользователя
      const userData = getTelegramUserData();
      setTelegramUser(userData);
      
      // Настраиваем цвет заголовка
      window.Telegram?.WebApp?.setHeaderColor('#1E88E5');
    }
  }, []);

  // Проверяем статус подключения TON кошелька при загрузке профиля
  useEffect(() => {
    if (user && profile) {
      try {
        // Проверяем подключение TON кошелька
        const tonConnectService = TonConnectService.getInstance();
        
        // Если кошелек подключен, получаем адрес
        if (tonConnectService.isConnected()) {
          const address = tonConnectService.getWalletAddress();
          if (address) {
            setTonWalletConnected(true);
            setTonWalletAddress(address);
          }
        }
        
        // Если в профиле уже есть сохраненный адрес кошелька, отображаем его
        if (profile.wallet?.walletAddress) {
          if (!tonWalletAddress) {
            setTonWalletAddress(profile.wallet.walletAddress);
          }
        }
      } catch (error) {
        console.error('Error checking TON wallet connection:', error);
      }
    }
  }, [user, profile, tonWalletAddress]);

  // Обновляем профиль при изменении данных пользователя
  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleAnonymousLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const auth = getAuth();
      await signInAnonymously(auth);
      // После успешной авторизации refreshProfile будет вызван через эффект
    } catch (error) {
      console.error("Ошибка при анонимной авторизации:", error);
      setLoginError("Не удалось выполнить вход. Пожалуйста, попробуйте позже.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Обработчик подключения TON кошелька
  const handleTonWalletConnected = async (walletAddress: string) => {
    console.log('TON wallet connected:', walletAddress);
    setTonWalletConnected(true);
    setTonWalletAddress(walletAddress);
    setTonWalletError(null);

    if (user && walletAddress) {
      try {
        // Сохраняем адрес TON кошелька в профиле пользователя
        const userDocRef = doc(db, 'users', user.uid);
        
        await updateDoc(userDocRef, {
          'wallet.walletAddress': walletAddress,
          updatedAt: Timestamp.now()
        });
        
        // Обновляем профиль после сохранения
        refreshProfile();
      } catch (error) {
        console.error('Error saving TON wallet address to profile:', error);
      }
    }
  };
  
  // Обработчик ошибки подключения TON кошелька
  const handleTonWalletError = (error: string) => {
    console.error('TON wallet error:', error);
    setTonWalletError(error);
  };

  // Define tabs with explicit ReactElement types
  const tabs = [
    { label: 'Активные билеты', icon: <CardGiftcard /> },
    { label: 'История', icon: <History /> },
    { label: 'Личные данные', icon: <Person /> }
  ];

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Отображаем экран входа, если пользователь не авторизован
  if (!user && !loading) {
    return (
      <PageContainer maxWidth="sm">
        <ContentContainer
          initial="initial"
          animate="animate"
          variants={pageVariants}
        >
          <motion.div variants={itemVariants}>
            <LoginContainer>
              <Typography variant="h5" gutterBottom>
                Необходимо войти в профиль
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Для доступа к профилю и участия в розыгрышах, пожалуйста, выполните вход
              </Typography>
              
              {loginError && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {loginError}
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loginLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                onClick={handleAnonymousLogin}
                disabled={loginLoading}
                sx={{ mt: 2 }}
              >
                {loginLoading ? 'Вход...' : 'Войти как гость'}
              </Button>
              
              {isTelegram && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Если вы открыли это приложение в Telegram, авторизация должна произойти автоматически
                </Typography>
              )}
            </LoginContainer>
          </motion.div>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>
          <Typography variant="h6" gutterBottom>Ошибка</Typography>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={refreshProfile}
            sx={{ mt: 2 }}
          >
            Попробовать снова
          </Button>
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Fade in={!loading}>
        <ContentContainer
          initial="initial"
          animate="animate"
          variants={pageVariants}
        >
          <motion.div variants={itemVariants}>
            <ModernProfileHeader 
              profile={profile} 
              onEdit={handleEditProfile}
              isTelegramUser={isTelegram && !!telegramUser}
            />
          </motion.div>

          {/* Секция для TON кошелька только если это Telegram Mini App */}
          {isTelegram && (
            <motion.div variants={itemVariants}>
              <TonWalletSection>
                <Typography variant="h6" gutterBottom>
                  TON Кошелек
                </Typography>
                
                {tonWalletConnected && tonWalletAddress ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        component="img"
                        src={tonLogoBase64}
                        alt="TON"
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Кошелек подключен
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Адрес: {tonWalletAddress.slice(0, 8)}...{tonWalletAddress.slice(-8)}
                    </Typography>
                  </Box>
                ) : (
                  <TonConnectComponent
                    onSuccessConnect={handleTonWalletConnected}
                    onError={handleTonWalletError}
                  />
                )}
              </TonWalletSection>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <ModernTabs tabs={tabs} value={tabValue} onChange={handleTabChange} />
          </motion.div>
          
          <motion.div variants={itemVariants} style={{ minHeight: 300 }}>
            <ModernTabPanel value={tabValue} index={0}>
              <ActiveTickets userId={user?.uid} />
            </ModernTabPanel>
            
            <ModernTabPanel value={tabValue} index={1}>
              <TicketHistory userId={user?.uid} />
            </ModernTabPanel>
            
            <ModernTabPanel value={tabValue} index={2}>
              <ModernProfileInfo profile={profile} loading={loading} />
            </ModernTabPanel>
          </motion.div>
          
          <EditProfileForm 
            open={editDialogOpen} 
            onClose={handleCloseEditDialog} 
            profile={profile} 
            onProfileUpdated={refreshProfile}
          />
        </ContentContainer>
      </Fade>
    </PageContainer>
  );
};

export default ProfilePage; 