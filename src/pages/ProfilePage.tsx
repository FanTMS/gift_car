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
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Обновить страницу
          </Button>
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <ContentContainer
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <motion.div variants={itemVariants}>
          <ModernProfileHeader 
            profile={profile} 
            loading={loading} 
            onEditProfile={handleEditProfile} 
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <ModernTabs 
            value={tabValue} 
            onChange={handleTabChange} 
            tabs={tabs}
          />
        </motion.div>
        
        <Box sx={{ position: 'relative', width: '100%' }}>
          <ModernTabPanel value={tabValue} index={0}>
            <ActiveTickets profile={profile} loading={loading} />
          </ModernTabPanel>
          
          <ModernTabPanel value={tabValue} index={1}>
            <TicketHistory profile={profile} loading={loading} />
          </ModernTabPanel>
          
          <ModernTabPanel value={tabValue} index={2}>
            <ModernProfileInfo profile={profile} loading={loading} />
          </ModernTabPanel>
        </Box>
      </ContentContainer>
      
      <EditProfileForm 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog} 
        profile={profile} 
        onProfileUpdated={refreshProfile} 
      />
    </PageContainer>
  );
};

export default ProfilePage; 