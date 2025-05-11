import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box,
  Badge,
  Typography,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { 
  Home, 
  Person, 
  DirectionsCar,
  Notifications,
  AccountBalanceWallet,
  Search,
  Settings
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { useFirebase } from '../../context/FirebaseContext';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Объявляем расширенный интерфейс Window для типизации Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton?: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        }
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
        }
        setHeaderColor: (color: string) => void;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

const NavigationContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 2),
  maxWidth: '100%',
  margin: '0 auto',
  paddingBottom: 'env(safe-area-inset-bottom)',
  boxShadow: 'none',
  background: 'transparent',
}));

const NavigationBar = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 520,
  height: 54,
  borderRadius: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1.2),
  margin: '0 auto',
  marginBottom: theme.spacing(1),
  position: 'relative',
  background: theme.palette.mode === 'light' 
    ? alpha(theme.palette.background.paper, 0.92)
    : alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(12px)',
  boxShadow: theme.palette.mode === 'light'
    ? '0 -3px 10px rgba(0, 0, 0, 0.04), 0 4px 10px rgba(0, 0, 0, 0.04)'
    : '0 -3px 10px rgba(0, 0, 0, 0.10), 0 4px 10px rgba(0, 0, 0, 0.10)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '32%',
    height: 3,
    borderRadius: 12,
    background: alpha(theme.palette.text.primary, 0.08),
  }
}));

const NavItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  flex: 1,
  cursor: 'pointer',
  padding: theme.spacing(1.2, 0.8),
  color: alpha(theme.palette.text.secondary, 0.8),
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-3px)',
  },
  '&.active': {
    color: theme.palette.primary.main,
  },
}));

const NavIconBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(0.3),
  '& .MuiSvgIcon-root': {
    fontSize: '1.1rem',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  '.active & .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
}));

const NavText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  lineHeight: 1.2,
  fontWeight: 500,
  textAlign: 'center',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  opacity: 0.9,
  '.active &': {
    fontWeight: 600,
    opacity: 1,
  }
}));

const ActiveIndicator = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: 46,
  height: 46,
  borderRadius: '50%',
  top: -2,
  zIndex: -1,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.15)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const CenterButton = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  bottom: '50%',
  left: '50%',
  transform: 'translate(-50%, 40%)',
  zIndex: 2,
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)'
    : 'linear-gradient(135deg, #4C9AFF 0%, #2684FF 100%)',
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 25px rgba(0, 82, 204, 0.25)'
    : '0 8px 25px rgba(76, 154, 255, 0.3)',
  cursor: 'pointer',
  border: `3px solid ${theme.palette.background.paper}`,
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    transform: 'translate(-50%, 35%) scale(1.05)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 12px 30px rgba(0, 82, 204, 0.35)'
      : '0 12px 30px rgba(76, 154, 255, 0.4)',
  }
}));

interface NavItemType {
  path: string;
  label: string;
  icon: React.ReactNode;
  withBadge?: boolean;
}

const StyledBottomNavigation = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: 'var(--safe-area-bottom, 0px)',
  zIndex: 1100,
  boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px 12px 0 0',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(18, 18, 18, 0.85)' 
    : 'rgba(255, 255, 255, 0.85)',
  transition: 'all 0.3s ease',
  '& .MuiBottomNavigationAction-root': {
    maxWidth: 'none',
    minWidth: 'auto',
    padding: '6px 0',
    fontSize: '0.75rem',
    '&.Mui-selected': {
      fontSize: '0.75rem',
    },
  },
}));

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { unreadCount } = useNotifications();
  const { isAdmin } = useFirebase();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);
  
  useEffect(() => {
    // Проверка на Telegram Mini App через window.Telegram
    const isTelegram = Boolean(window.Telegram?.WebApp);
    setIsTelegramMiniApp(isTelegram);
    
    setMounted(true);
  }, []);
  
  // Функция для определения активной вкладки
  const getActiveTab = () => {
    const path = location.pathname;
    
    if (path === '/') return 0;
    if (path.startsWith('/raffles')) return 1;
    if (path.startsWith('/wallet')) return 2;
    if (path.startsWith('/notifications')) return 3;
    if (path.startsWith('/profile')) return 4;
    
    return 0; // По умолчанию - главная
  };
  
  // Обработчик изменения вкладки
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch(newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/raffles');
        break;
      case 2:
        navigate('/wallet');
        break;
      case 3:
        navigate('/notifications');
        break;
      case 4:
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };
  
  // Только ждем монтирования, но НЕ скрываем в Telegram Mini App
  if (!mounted) return null;
  
  return (
    <StyledBottomNavigation
      elevation={3}
      sx={{
        // Добавляем специальные стили для Telegram Mini App
        ...(isTelegramMiniApp && {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.92)' 
            : 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0px -1px 5px rgba(0, 0, 0, 0.12)',
        })
      }}
    >
      <BottomNavigation
        value={getActiveTab()}
        onChange={handleChange}
        showLabels
        sx={{
          width: '100%',
          bgcolor: 'transparent',
        }}
      >
        <BottomNavigationAction 
          label="Главная" 
          icon={<Home />} 
        />
        <BottomNavigationAction 
          label="Розыгрыши" 
          icon={<DirectionsCar />} 
        />
        <BottomNavigationAction 
          label="Кошелек" 
          icon={<AccountBalanceWallet />} 
        />
        <BottomNavigationAction 
          label="Уведомления" 
          icon={
            <Badge color="error" badgeContent={unreadCount > 0 ? unreadCount : null} max={99}>
              <Notifications />
            </Badge>
          } 
        />
        <BottomNavigationAction 
          label="Профиль" 
          icon={<Person />} 
        />
      </BottomNavigation>
    </StyledBottomNavigation>
  );
};

export default BottomNavigationBar; 