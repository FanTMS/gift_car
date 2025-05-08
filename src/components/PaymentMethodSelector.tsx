import React from 'react';
import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Divider,
  styled,
  Paper,
  alpha
} from '@mui/material';
import { PaymentMethod } from '../types/payment';

// Стилизованный контейнер для платежного метода
const PaymentMethodItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  }
}));

// Логотипы платежных систем
const YooMoneyLogo = () => (
  <Box 
    component="img" 
    src="/assets/yoomoney-logo.svg" 
    alt="YooMoney" 
    sx={{ 
      height: 24,
      objectFit: 'contain',
      filter: 'grayscale(0.4)',
      '.selected &': {
        filter: 'grayscale(0)',
      }
    }} 
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
);

const TelegramWalletLogo = () => (
  <Box 
    component="img" 
    src="/assets/telegram-wallet-logo.svg" 
    alt="Telegram Wallet" 
    sx={{ 
      height: 24,
      objectFit: 'contain',
      filter: 'grayscale(0.4)',
      '.selected &': {
        filter: 'grayscale(0)',
      }
    }} 
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
);

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMethodChange(event.target.value as PaymentMethod);
  };

  const handleItemClick = (method: PaymentMethod) => {
    onMethodChange(method);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Выберите способ оплаты
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <RadioGroup
        aria-label="payment-method"
        name="payment-method"
        value={selectedMethod}
        onChange={handleMethodChange}
      >
        <PaymentMethodItem 
          className={selectedMethod === 'yoomoney' ? 'selected' : ''}
          onClick={() => handleItemClick('yoomoney')}
          elevation={0}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                value="yoomoney"
                control={<Radio />}
                label=""
                sx={{ mr: 0 }}
              />
              <Box sx={{ ml: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Банковская карта
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visa, MasterCard, МИР
                </Typography>
              </Box>
            </Box>
            <YooMoneyLogo />
          </Box>
        </PaymentMethodItem>
        
        <PaymentMethodItem 
          className={selectedMethod === 'telegram_wallet' ? 'selected' : ''}
          onClick={() => handleItemClick('telegram_wallet')}
          elevation={0}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                value="telegram_wallet"
                control={<Radio />}
                label=""
                sx={{ mr: 0 }}
              />
              <Box sx={{ ml: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Telegram Кошелек
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Быстрая оплата через Telegram
                </Typography>
              </Box>
            </Box>
            <TelegramWalletLogo />
          </Box>
        </PaymentMethodItem>
      </RadioGroup>
    </Box>
  );
};

export default PaymentMethodSelector; 