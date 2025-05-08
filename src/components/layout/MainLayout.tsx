import React from 'react';
import { Box, CssBaseline, Container, useTheme } from '@mui/material';
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
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.standard,
  }),
}));

const PageContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  paddingBottom: theme.spacing(14), // Увеличенный отступ снизу для нижней навигации
  paddingTop: theme.spacing(1),
  maxWidth: theme.breakpoints.values.lg,
  position: 'relative',
  zIndex: 1,
}));

const BackgroundGradient = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '50vh',
  zIndex: 0,
  pointerEvents: 'none',
}));

const SecondaryGradient = styled(Box)(({ theme }) => ({
  position: 'fixed',
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
  
  const gradientBackground = isDarkMode 
    ? 'radial-gradient(circle at top left, rgba(21, 101, 192, 0.15) 0%, rgba(13, 71, 161, 0) 70%)'
    : 'radial-gradient(circle at top left, rgba(33, 150, 243, 0.15) 0%, rgba(25, 118, 210, 0) 70%)';
    
  const secondaryGradient = isDarkMode 
    ? 'radial-gradient(circle at bottom right, rgba(21, 101, 192, 0.1) 0%, rgba(13, 71, 161, 0) 70%)'
    : 'radial-gradient(circle at bottom right, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0) 70%)';
  
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
          style={{ flex: 1 }}
        >
          <PageContainer>
            <Outlet />
          </PageContainer>
        </motion.div>
      </AnimatePresence>
      
      <BottomNavigationBar />
    </MainContainer>
  );
};

export default MainLayout; 