import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Fade
} from '@mui/material';
import { 
  CardGiftcard, 
  History, 
  Person,
  Settings
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
      
      // Обновляем профиль пользователя с данными из Telegram
      if (userData && profile && profile.id) {
        // Если профиль уже существует, проверим, обновлять ли его
        const shouldUpdateTelegramData = !profile.telegramId && userData.id;
        
        if (shouldUpdateTelegramData) {
          // Обновляем данные Telegram в профиле
          const telegramData = {
            telegramId: userData.id.toString(),
            displayName: userData.first_name + (userData.last_name ? ' ' + userData.last_name : ''),
            photoURL: userData.photo_url,
            username: userData.username,
            updatedAt: new Date()
          };
          
          // Реализовать обновление профиля здесь
          // updateUserProfile(profile.id, telegramData)
          //   .then(() => refreshProfile())
          //   .catch(console.error);
        }
      }
    }
  }, [profile]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
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

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>
          <Typography variant="h6" gutterBottom>Ошибка</Typography>
          <Typography>{error}</Typography>
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