import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { EmojiEvents } from '@mui/icons-material';

const SplashContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999,
  backgroundColor: theme.palette.mode === 'light' ? '#f5f7fa' : '#121212',
}));

const LogoContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const AppName = styled(motion.div)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: '1.8rem',
  fontWeight: 700,
  background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  position: 'relative',
}));

const LoadingSplash: React.FC = () => {
  return (
    <SplashContainer>
      <LogoContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            rotateZ: [0, 10, 0, -10, 0],
            y: [0, -10, 0, -5, 0]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            repeatType: 'loop'
          }}
        >
          <EmojiEvents 
            sx={{ 
              fontSize: 80, 
              color: '#2196F3',
            }} 
          />
        </motion.div>
        
        <AppName
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Авторозыгрыш
        </AppName>
      </LogoContainer>
      
      <ProgressContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <CircularProgress 
            size={44} 
            thickness={4}
            sx={{ color: '#2196F3' }} 
          />
        </motion.div>
      </ProgressContainer>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        component={motion.p}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        sx={{ mt: 2 }}
      >
        Загрузка приложения...
      </Typography>
    </SplashContainer>
  );
};

export default LoadingSplash; 