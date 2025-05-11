import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useMediaQuery,
  Container,
  Button,
  Divider
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { 
  Notifications, 
  DirectionsCar, 
  DarkMode, 
  LightMode, 
  Menu as MenuIcon,
  AccountCircle,
  Login,
  Logout,
  Settings,
  ConfirmationNumber,
  Search,
  Home,
  EmojiEvents,
  CardGiftcard,
  Person,
  ArrowForward
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useFirebase } from '../../context/FirebaseContext';
import NotificationBell from '../NotificationBell';

// Объявляем типы для Telegram WebApp
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

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
  backdropFilter: 'blur(20px)',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
}));

const AppBarInner = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'light' 
    ? alpha(theme.palette.background.paper, 0.75)
    : alpha(theme.palette.background.paper, 0.65),
  boxShadow: theme.palette.mode === 'light'
    ? '0 10px 30px rgba(0, 0, 0, 0.06)'
    : '0 10px 30px rgba(0, 0, 0, 0.15)',
  borderRadius: '0 0 18px 18px',
  margin: theme.spacing(0, 1),
  padding: theme.spacing(0, 1),
  height: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  borderTop: 'none',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0, 0.5),
    borderRadius: '0 0 14px 14px',
    height: 48,
    padding: theme.spacing(0, 0.5),
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.2),
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.2),
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  borderRadius: 14,
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.divider, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.divider, 0.14),
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 6px 16px rgba(0, 0, 0, 0.06)'
      : '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
  width: 42,
  height: 42,
  [theme.breakpoints.down('sm')]: {
    width: 38,
    height: 38,
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  borderRadius: 14,
  padding: theme.spacing(1, 2.5),
  backgroundColor: alpha(theme.palette.divider, 0.08),
  color: theme.palette.text.secondary,
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.divider, 0.15),
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 6px 16px rgba(0, 0, 0, 0.05)'
      : '0 6px 16px rgba(0, 0, 0, 0.12)',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(0.8),
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1, 1.5),
    '& .MuiButton-startIcon': {
      marginRight: 0,
    },
    '& .search-text': {
      display: 'none',
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: 14,
  fontWeight: 600,
  padding: theme.spacing(1.2, 2.5),
  color: theme.palette.text.primary,
  backgroundColor: 'transparent',
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 6px 16px rgba(0, 0, 0, 0.04)'
      : '0 6px 16px rgba(0, 0, 0, 0.1)',
  },
  '&.active': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
  },
}));

const AvatarButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  width: 44,
  height: 44,
  overflow: 'hidden',
  borderRadius: 14,
  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)},
                0 6px 16px rgba(0, 0, 0, 0.1)`,
  },
  [theme.breakpoints.down('sm')]: {
    width: 40,
    height: 40,
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 14,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2.5),
  boxShadow: theme.palette.mode === 'light' 
    ? '0 6px 18px rgba(0, 82, 204, 0.15)' 
    : '0 6px 18px rgba(76, 154, 255, 0.2)',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)'
    : 'linear-gradient(135deg, #4C9AFF 0%, #2684FF 100%)',
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 25px rgba(0, 82, 204, 0.25)'
      : '0 8px 25px rgba(76, 154, 255, 0.3)',
    transform: 'translateY(-3px) scale(1.02)',
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #0747A6 0%, #0052CC 100%)'
      : 'linear-gradient(135deg, #2684FF 0%, #4C9AFF 100%)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.8, 2),
    fontSize: '0.9rem',
  },
}));

const MenuPaper = styled(Box)(({ theme }) => ({
  overflow: 'visible',
  filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.15))',
  marginTop: theme.spacing(1.5),
  borderRadius: 20,
  minWidth: 200,
  backdropFilter: 'blur(20px)',
  backgroundColor: theme.palette.mode === 'light'
    ? alpha(theme.palette.background.paper, 0.9)
    : alpha(theme.palette.background.paper, 0.8),
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    right: 16,
    width: 12,
    height: 12,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 0,
  },
}));

const MenuItem2 = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  borderRadius: 12,
  gap: theme.spacing(1.5),
  margin: theme.spacing(0.4),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(3px)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
    color: theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary,
  },
}));

// Обновленные стили для меню
const menuPaperStyles = {
  overflow: 'visible',
  filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.15))',
  mt: 1.5,
  borderRadius: 3,
  minWidth: 200,
  backdropFilter: 'blur(20px)',
  bgcolor: (theme: any) => theme.palette.mode === 'light'
    ? alpha(theme.palette.background.paper, 0.9)
    : alpha(theme.palette.background.paper, 0.8),
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    right: 16,
    width: 12,
    height: 12,
    bgcolor: 'background.paper',
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 0,
  },
};

const AppHeader: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { appSettings, isAdmin, user, profile } = useFirebase();
  
  const [profileMenu, setProfileMenu] = useState<null | HTMLElement>(null);
  const [mobileMenu, setMobileMenu] = useState<null | HTMLElement>(null);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isProfileMenuOpen = Boolean(profileMenu);
  const isMobileMenuOpen = Boolean(mobileMenu);

  useEffect(() => {
    // Проверка на Telegram Mini App
    const isTelegram = Boolean(window?.Telegram?.WebApp);
    setIsTelegramMiniApp(isTelegram);
    
    // Настройка для Telegram Mini App
    if (isTelegram && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor(
        mode === 'dark' ? '#1e1e1e' : '#ffffff'
      );
      // Отключаем swipe-back и closing confirmation
      if (window.Telegram.WebApp.setSwipeBackAllowed) {
        window.Telegram.WebApp.setSwipeBackAllowed(false);
      }
      if (window.Telegram.WebApp.setClosingConfirmation) {
        window.Telegram.WebApp.setClosingConfirmation(false);
      }
    }
    
    // Обработчик прокрутки для изменения прозрачности шапки
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  // Обновляем состояние аутентификации при изменении пользователя
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenu(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setProfileMenu(null);
    setMobileMenu(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    handleMenuClose();
  };

  // Настройка навигационных ссылок
  const baseNavItems = [
    { path: '/', label: 'Главная', icon: <Home /> },
    { path: '/raffles', label: 'Розыгрыши', icon: <DirectionsCar /> },
    { path: '/wallet', label: 'Кошелек', icon: <AccountCircle /> },
    { path: '/profile', label: 'Профиль', icon: <Person /> },
  ];
  
  // Добавляем "Настройки" только для админов
  const navItems = isAdmin 
    ? [...baseNavItems, { path: '/settings', label: 'Настройки', icon: <Settings /> }]
    : baseNavItems;

  return (
    <StyledAppBar 
      elevation={0} 
      className="safe-area-padding"
      sx={{
        backgroundColor: isScrolled 
          ? alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.8)
          : 'transparent',
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <AppBarInner
          sx={{
            boxShadow: isScrolled ? (theme.palette.mode === 'light' 
              ? '0 10px 30px rgba(0, 0, 0, 0.08)'
              : '0 10px 30px rgba(0, 0, 0, 0.2)') 
              : 'none',
            background: isScrolled ? (theme.palette.mode === 'light' 
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.8)) 
              : (theme.palette.mode === 'light' 
                ? alpha(theme.palette.background.paper, 0.75)
                : alpha(theme.palette.background.paper, 0.65)),
          }}
        >
          <LogoContainer>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{
                repeat: Infinity,
                repeatType: 'loop',
                duration: 8,
                ease: 'easeInOut',
                times: [0, 0.25, 0.75, 1]
              }}
            >
              {appSettings?.logoUrl ? (
                <Box 
                  component="img" 
                  src={appSettings.logoUrl} 
                  alt="Логотип" 
                  sx={{ 
                    height: { xs: 40, sm: 46 }, 
                    width: { xs: 40, sm: 46 },
                    objectFit: 'contain',
                    marginRight: 1.2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    padding: 1,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)},
                                0 5px 15px ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: { xs: 40, sm: 46 }, 
                    width: { xs: 40, sm: 46 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)},
                                0 5px 15px ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <DirectionsCar 
                    sx={{ 
                      fontSize: { xs: 24, sm: 28 },
                      color: theme.palette.primary.main
                    }} 
                  />
                </Box>
              )}
            </motion.div>
            
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
                backgroundImage: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)'
                  : 'linear-gradient(135deg, #0747A6 0%, #0052CC 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em'
              }}
            >
              {appSettings?.appName || "Перчини"}
            </Typography>
          </LogoContainer>

          {/* Навигация для десктопа */}
          {!isMobile && !isTelegramMiniApp && (
            <Box 
              sx={{ 
                display: 'flex',
                mx: 2,
                backgroundColor: alpha(theme.palette.divider, 0.05),
                borderRadius: 3.5,
                py: 0.8,
                px: 0.8,
                boxShadow: isScrolled ? `0 4px 15px ${alpha(theme.palette.divider, 0.1)}` : 'none',
              }}
            >
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={() => navigate(item.path)}
                  startIcon={isMobile ? null : item.icon}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>
          )}

          <ActionsContainer>
            {!isTablet && (
              <SearchButton
                startIcon={<Search />}
                onClick={() => navigate('/search')}
              >
                <span className="search-text">Поиск</span>
              </SearchButton>
            )}
            
            {!isTelegramMiniApp && (
              <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Темная тема'}>
                <IconButtonStyled onClick={toggleTheme}>
                  {mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButtonStyled>
              </Tooltip>
            )}
            
            {!isMobile && !isTelegramMiniApp && (
              <NotificationBell />
            )}
            
            {isAuthenticated ? (
              <AvatarButton
                onClick={handleProfileMenuOpen}
                aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen ? 'true' : undefined}
              >
                <Avatar
                  src={profile?.photoURL || "/avatar-placeholder.jpg"} 
                  alt={profile?.displayName || "Профиль"}
                  sx={{ width: '100%', height: '100%' }}
                />
              </AvatarButton>
            ) : (
              <LoginButton
                variant="contained"
                disableElevation
                startIcon={<Login />}
                onClick={handleLogin}
              >
                {isMobile ? "Войти" : "Войти"}
              </LoginButton>
            )}
            
            {isMobile && !isTelegramMiniApp && (
              <IconButtonStyled
                edge="end"
                onClick={handleMobileMenuOpen}
                aria-controls={isMobileMenuOpen ? 'mobile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMobileMenuOpen ? 'true' : undefined}
              >
                <MenuIcon />
              </IconButtonStyled>
            )}
          </ActionsContainer>
        </AppBarInner>
      </Container>
      
      {/* Меню профиля */}
      <Menu
        id="profile-menu"
        anchorEl={profileMenu}
        open={isProfileMenuOpen}
        onClose={handleMenuClose}
        disableScrollLock
        PaperProps={{
          elevation: 0,
          sx: menuPaperStyles,
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <Avatar 
            src={profile?.photoURL || "/avatar-placeholder.jpg"} 
            alt={profile?.displayName || "Профиль"}
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto',
              mb: 1.5,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.15)}`
            }}
          />
          <Typography variant="subtitle1" fontWeight={700} fontSize="1.1rem">
            {profile?.displayName || 'Пользователь'}
          </Typography>
          {profile?.username && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 0.5, opacity: 0.7 }} />
        
        <MenuItem2 onClick={() => {handleMenuClose(); navigate('/profile')}}>
          <Person />
          Профиль
        </MenuItem2>
        
        <MenuItem2 onClick={() => {handleMenuClose(); navigate('/tickets')}}>
          <ConfirmationNumber />
          Мои билеты
        </MenuItem2>
        
        <MenuItem2 onClick={() => {handleMenuClose(); navigate('/settings')}}>
          <Settings />
          Настройки
        </MenuItem2>
        
        <Box sx={{ p: 2.5, pt: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              py: 1.2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            Выйти
          </Button>
        </Box>
      </Menu>
      
      {/* Мобильное меню */}
      <Menu
        id="mobile-menu"
        anchorEl={mobileMenu}
        open={isMobileMenuOpen}
        onClose={handleMenuClose}
        disableScrollLock
        PaperProps={{
          elevation: 0,
          sx: {
            ...menuPaperStyles,
            width: '75vw',
            maxWidth: 320
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2.5, mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
            Меню
          </Typography>
        </Box>
        
        {navItems.map((item) => (
          <MenuItem2
            key={item.path}
            onClick={() => {handleMenuClose(); navigate(item.path)}}
            sx={{
              backgroundColor: location.pathname === item.path 
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
              color: location.pathname === item.path 
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              fontWeight: location.pathname === item.path ? 600 : 400
            }}
          >
            {item.icon}
            {item.label}
          </MenuItem2>
        ))}
        
        <Box sx={{ my: 1.5, mx: 2.5 }}>
          <SearchButton
            startIcon={<Search />}
            onClick={() => {handleMenuClose(); navigate('/search')}}
            fullWidth
            sx={{ 
              justifyContent: 'flex-start', 
              textAlign: 'left', 
              py: 1.5,
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.05)}`
            }}
          >
            Поиск
          </SearchButton>
        </Box>
        
        <Divider sx={{ my: 1, opacity: 0.7 }} />
        
        <MenuItem2 onClick={() => {handleMenuClose(); navigate('/notifications')}}>
          <Badge 
            color="error" 
            variant="dot" 
            overlap="circular"
          >
            <Notifications />
          </Badge>
          Уведомления
        </MenuItem2>
        
        <MenuItem2 onClick={() => {handleMenuClose(); navigate('/rewards')}}>
          <CardGiftcard />
          Каталог призов
        </MenuItem2>
        
        <Box sx={{ p: 2.5, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
            endIcon={<ArrowForward />}
            onClick={() => {handleMenuClose(); navigate('/profile')}}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              py: 1.2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0747A6 0%, #0052CC 100%)',
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`
              },
              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            Мой профиль
          </Button>
        </Box>
      </Menu>
    </StyledAppBar>
  );
};

export default AppHeader; 