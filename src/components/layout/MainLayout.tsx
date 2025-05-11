import React, { useEffect } from 'react';
import { Box, CssBaseline, Container, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNavigationBar from './BottomNavigation';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up('md')]: {
    overflow: 'auto',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
  paddingBottom: theme.spacing(7),
  [theme.breakpoints.down('sm')]: {
    paddingBottom: theme.spacing(8),
  },
  [theme.breakpoints.up('md')]: {
    overflowY: 'auto',
    minHeight: 'calc(100vh - 64px)',
  },
}));

const PageContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  paddingBottom: theme.spacing(6),
  paddingTop: theme.spacing(1),
  maxWidth: theme.breakpoints.values.lg,
  position: 'relative',
  zIndex: 1,
}));

const BackgroundGradient = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '50vh',
  zIndex: 0,
  pointerEvents: 'none',
}));

const SecondaryGradient = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '100%',
  height: '50vh',
  zIndex: 0,
  pointerEvents: 'none',
}));

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: 20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDarkMode = mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const gradientBackground = isDarkMode 
    ? 'radial-gradient(circle at top left, rgba(21, 101, 192, 0.15) 0%, rgba(13, 71, 161, 0) 70%)'
    : 'radial-gradient(circle at top left, rgba(33, 150, 243, 0.15) 0%, rgba(25, 118, 210, 0) 70%)';
    
  const secondaryGradient = isDarkMode 
    ? 'radial-gradient(circle at bottom right, rgba(21, 101, 192, 0.1) 0%, rgba(13, 71, 161, 0) 70%)'
    : 'radial-gradient(circle at bottom right, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0) 70%)';
  
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <MainContainer>
      <CssBaseline />
      <BackgroundGradient sx={{ background: gradientBackground }} />
      <SecondaryGradient sx={{ background: secondaryGradient }} />
      <AppHeader />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={window.location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }}
        >
          <ContentContainer>
            <PageContainer>
              <Outlet />
            </PageContainer>
          </ContentContainer>
        </motion.div>
      </AnimatePresence>
      
      <BottomNavigationBar />
    </MainContainer>
  );
};

export default MainLayout; 