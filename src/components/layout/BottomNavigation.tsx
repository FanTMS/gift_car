import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box,
  Badge,
  Typography,
  useMediaQuery
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
  height: 78,
  borderRadius: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2.5),
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  position: 'relative',
  background: theme.palette.mode === 'light' 
    ? alpha(theme.palette.background.paper, 0.92)
    : alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(20px)',
  boxShadow: theme.palette.mode === 'light'
    ? '0 -6px 25px rgba(0, 0, 0, 0.05), 0 8px 25px rgba(0, 0, 0, 0.05)'
    : '0 -6px 25px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.15)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40%',
    height: 5,
    borderRadius: 20,
    background: alpha(theme.palette.text.primary, 0.1),
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
  marginBottom: theme.spacing(0.6),
  '& .MuiSvgIcon-root': {
    fontSize: '1.4rem',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  '.active & .MuiSvgIcon-root': {
    fontSize: '1.5rem',
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
  
  // Базовые элементы навигации для всех пользователей
  const navItems: NavItemType[] = [
    { path: '/', label: 'Главная', icon: <Home fontSize="small" /> },
    { path: '/raffles', label: 'Розыгрыши', icon: <DirectionsCar fontSize="small" /> },
    { path: '/wallet', label: 'Кошелек', icon: <AccountBalanceWallet fontSize="small" /> },
    { path: '/notifications', label: 'Уведомления', icon: <Notifications fontSize="small" />, withBadge: true },
    { path: '/profile', label: 'Профиль', icon: <Person fontSize="small" /> },
  ];
  
  // Добавляем пункт "Настройки" только для администраторов
  const navItemsWithSettings: NavItemType[] = isAdmin 
    ? [...navItems, { path: '/settings', label: 'Настройки', icon: <Settings fontSize="small" /> }]
    : navItems;
  
  const handleNavClick = (path: string) => () => {
    // Анимация клика для тактильной обратной связи
    const navigationWithFeedback = async () => {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(15); // Улучшенная тактильная обратная связь
        } catch (e) {
          console.log('Vibration not supported');
        }
      }
      navigate(path);
    };
    
    navigationWithFeedback();
  };
  
  const renderNavItems = () => {
    return navItemsWithSettings.map((item) => {
      const isActive = location.pathname === item.path || 
                      (item.path !== '/' && location.pathname.startsWith(item.path));
      
      return (
        <NavItem 
          key={item.path} 
          className={isActive ? 'active' : ''}
          onClick={handleNavClick(item.path)}
        >
          <NavIconBox>
            {isActive && (
              <ActiveIndicator
                layoutId="activeIndicator"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35
                }}
              />
            )}
            
            {item.withBadge ? (
              <Badge 
                color="error" 
                variant="dot" 
                invisible={unreadCount === 0}
                sx={{ 
                  '& .MuiBadge-badge': {
                    top: 3,
                    right: 3,
                    transform: 'scale(1.2) translate(25%, -25%)',
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
                  }
                }}
              >
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
          </NavIconBox>
          
          <NavText variant="caption">
            {item.label}
          </NavText>
        </NavItem>
      );
    });
  };
  
  if (!mounted || isTelegramMiniApp) return null;
  
  return (
    <NavigationContainer 
      elevation={0}
      className="safe-area-padding-bottom"
    >
      <NavigationBar>
        {renderNavItems()}
      </NavigationBar>
    </NavigationContainer>
  );
};

export default BottomNavigationBar; 