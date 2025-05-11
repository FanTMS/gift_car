import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  alpha,
  useTheme,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Стили компонентов
const TelegramWalletCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(2.5),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha('#0088cc', 0.08)} 0%, ${alpha('#0088cc', 0.05)} 100%)`,
  border: `1px solid ${alpha('#0088cc', 0.15)}`,
  overflow: 'hidden',
  position: 'relative',
}));

const CircleDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: alpha('#0088cc', 0.05),
  zIndex: 0,
}));

const TelegramConnectButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 136, 204, 0.2)',
  background: '#0088cc',
  color: '#fff',
  '&:hover': {
    background: '#0077b3',
    boxShadow: '0 6px 16px rgba(0, 136, 204, 0.3)',
    transform: 'translateY(-2px)',
  }
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  borderRadius: '50%',
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  background: alpha('#0088cc', 0.1),
  color: '#0088cc',
}));

interface WalletWidgetProps {
  balance: number;
}

const WalletWidget: React.FC<WalletWidgetProps> = ({ balance }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const handleConnectTelegramWallet = () => {
    // Перенаправляем на страницу подключения Telegram кошелька
    navigate('/wallet/telegram');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Блок с Telegram кошельком */}
      <TelegramWalletCard>
        <CircleDecoration 
          sx={{ 
            top: '-30px', 
            right: '-30px', 
            width: '120px', 
            height: '120px' 
          }} 
        />
        <CircleDecoration 
          sx={{ 
            bottom: '-20px', 
            left: '20px', 
            width: '80px', 
            height: '80px' 
          }} 
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Avatar 
              src="/telegram-logo.png" 
              alt="Telegram" 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#0088cc',
                mr: 1.5 
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
            </Avatar>
            <Typography variant="h6" fontWeight={600} color="#0D70B2">
              Telegram Кошелек
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', maxWidth: '90%' }}>
            Подключите ваш Telegram-аккаунт для мгновенных транзакций, участия в розыгрышах и получения уведомлений о выигрышах прямо в мессенджере.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FeatureItem>
              <FeatureIcon>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </FeatureIcon>
              <Typography variant="body2">Мгновенные пополнения и выплаты</Typography>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </FeatureIcon>
              <Typography variant="body2">Уведомления о выигрышах и акциях</Typography>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </FeatureIcon>
              <Typography variant="body2">Защищенные транзакции и авторизация</Typography>
            </FeatureItem>
          </Box>
          
          <TelegramConnectButton
            onClick={handleConnectTelegramWallet}
            startIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
            }
          >
            Подключить Telegram
          </TelegramConnectButton>
        </Box>
      </TelegramWalletCard>
    </motion.div>
  );
};

export default WalletWidget; 