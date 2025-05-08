import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
  Tab,
  Tabs,
  Avatar,
  Container,
  Grid
} from '@mui/material';
import {
  AccountBalanceWallet,
  AddCircleOutline,
  ArrowUpward,
  ArrowDownward,
  Receipt,
  History,
  KeyboardArrowRight,
  Close,
  AttachMoney,
  CreditCard,
  LocalAtm,
  Telegram,
  ReceiptLong
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PaymentMethod } from '../types/payment';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { PaymentProcessorService } from '../services/payment/PaymentProcessorService';
import { useFirebase } from '../context/FirebaseContext';
import { getDoc, doc, getDocs, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// Стилизованные компоненты с современным дизайном
const WalletContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  maxWidth: '100%',
}));

const WalletCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: theme.spacing(4),
  background: theme.palette.mode === 'light'
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.95)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'light'
    ? '0 15px 35px rgba(0, 82, 204, 0.2), 0 5px 15px rgba(0, 0, 0, 0.05)'
    : '0 15px 35px rgba(16, 55, 117, 0.4), 0 5px 15px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `url('/assets/wallet-pattern.svg')`,
    backgroundSize: 'cover',
    opacity: 0.07,
    zIndex: 0,
  },
}));

const BalanceText = styled(Typography)(({ theme }) => ({
  fontSize: '2.4rem',
  fontWeight: 700,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'flex-end',
  '& .currency': {
    fontSize: '1.3rem',
    opacity: 0.9,
    marginLeft: theme.spacing(1),
    fontWeight: 500,
  }
}));

const CardPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '60%',
  height: '100%',
  background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
  zIndex: 0,
}));

const CardCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  zIndex: 0,
}));

const CardCircleSmall = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-30px',
  left: '20px',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.05)',
  zIndex: 0,
}));

const WalletIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  backdropFilter: 'blur(5px)',
  '& svg': {
    color: 'white',
    fontSize: 24,
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(6),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  fontSize: '0.95rem',
  '&:hover': {
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transform: 'translateY(-4px)',
  }
}));

const TransactionsList = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(4),
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'light'
    ? '0 5px 25px rgba(0, 0, 0, 0.05)'
    : '0 5px 25px rgba(0, 0, 0, 0.1)',
  marginTop: theme.spacing(4),
}));

const TransactionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

const TransactionIcon = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  '&.deposit': {
    backgroundColor: alpha(theme.palette.success.main, 0.12),
    color: theme.palette.success.main,
  },
  '&.purchase': {
    backgroundColor: alpha(theme.palette.info.main, 0.12),
    color: theme.palette.info.main,
  }
}));

const TransactionAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  '&.deposit': {
    color: theme.palette.success.main,
  },
  '&.purchase': {
    color: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.grey[100],
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontSize: '0.75rem',
  height: 24,
  fontWeight: 600,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: theme.spacing(1.5, 3),
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    }
  }
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  '& svg': {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    color: alpha(theme.palette.text.secondary, 0.5),
  }
}));

const TopupDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(2),
    maxWidth: 480,
    width: '100%',
  }
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2),
  '& .MuiTypography-root': {
    fontWeight: 700,
    fontSize: '1.25rem',
  }
}));

const AmountButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    borderColor: theme.palette.primary.main,
  }
}));

// Интерфейсы для типизации
interface Transaction {
  id: string;
  type: 'deposit' | 'purchase';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
  paymentMethod?: PaymentMethod;
}

const WalletPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openTopupDialog, setOpenTopupDialog] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yoomoney');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  // Загружаем баланс и транзакции
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Здесь получаем данные о балансе пользователя из Firebase
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBalance(userData.balance || 0);
          }

          // Получаем транзакции пользователя из Firebase
          const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
          
          const transactionsSnapshot = await getDocs(q);
          const transactionsData = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date() // Преобразуем Timestamp в Date
          })) as Transaction[];
          
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user]);

  // Обработчики для диалога пополнения
  const handleOpenTopupDialog = () => {
    setOpenTopupDialog(true);
    setTopupAmount('');
    setPaymentError(null);
  };

  const handleCloseTopupDialog = () => {
    setOpenTopupDialog(false);
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleProcessPayment = async () => {
    if (!topupAmount || isNaN(parseFloat(topupAmount)) || parseFloat(topupAmount) <= 0) {
      setPaymentError('Пожалуйста, введите корректную сумму');
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      const amount = parseFloat(topupAmount);
      const result = await PaymentProcessorService.processPayment(
        paymentMethod,
        amount,
        'Пополнение баланса',
        user?.uid,
        { operation: 'wallet_topup' }
      );
      
      if (!result.success) {
        setPaymentError(result.error || 'Ошибка при инициализации платежа');
        setIsProcessingPayment(false);
      }
      // Для успешных платежей перенаправление происходит в самом сервисе processPayment
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Произошла ошибка при обработке платежа');
      setIsProcessingPayment(false);
    }
  };

  // Предопределенные суммы для быстрого пополнения
  const quickAmounts = [500, 1000, 3000, 5000];

  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Анимационные варианты для карточки
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }
    }
  };

  // Фильтрация транзакций в зависимости от выбранной вкладки
  const filteredTransactions = transactions.filter(transaction => {
    if (tabValue === 0) return true; // Все транзакции
    if (tabValue === 1) return transaction.type === 'deposit'; // Только пополнения
    if (tabValue === 2) return transaction.type === 'purchase'; // Только покупки
    return true;
  });

  return (
    <WalletContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <WalletCard elevation={6}>
          <CardPattern />
          <CardCircle />
          <CardCircleSmall />
          <WalletIcon>
            <AccountBalanceWallet />
          </WalletIcon>
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.95, mb: 1 }}>
              Ваш баланс
            </Typography>
            
            <BalanceText variant="h3">
              {new Intl.NumberFormat('ru-RU', {
                maximumFractionDigits: 0
              }).format(balance)}
              <span className="currency">₽</span>
            </BalanceText>
            
            <Box sx={{ display: 'flex', mt: 3 }}>
              <ActionButton
                variant="contained"
                color="secondary"
                startIcon={<AddCircleOutline />}
                onClick={handleOpenTopupDialog}
                fullWidth
                sx={{ mr: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Пополнить
              </ActionButton>
              
              <ActionButton
                variant="contained"
                color="primary"
                sx={{ backgroundColor: 'white', color: theme.palette.primary.main }}
                startIcon={<Receipt />}
                fullWidth
                onClick={() => navigate('/wallet/history')}
              >
                История
              </ActionButton>
            </Box>
          </Box>
        </WalletCard>
      </motion.div>
      
      <StyledTabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        variant="fullWidth"
      >
        <Tab label="Все операции" />
        <Tab label="Пополнения" />
        <Tab label="Покупки" />
      </StyledTabs>
      
      <TransactionsList>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filteredTransactions.length > 0 ? (
          <List disablePadding>
            {filteredTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id}
                divider
                onClick={() => navigate(`/wallet/transaction/${transaction.id}`)}
              >
                <TransactionIcon className={transaction.type}>
                  {transaction.type === 'deposit' ? <ArrowUpward /> : <ArrowDownward />}
                </TransactionIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {transaction.description}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {format(transaction.date, 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </Typography>
                  }
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <TransactionAmount variant="subtitle1" className={transaction.type}>
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      maximumFractionDigits: 0
                    }).format(transaction.amount)}
                  </TransactionAmount>
                  
                  <StatusChip
                    size="small"
                    label={
                      transaction.status === 'completed' ? 'Выполнено' :
                      transaction.status === 'pending' ? 'В обработке' : 'Ошибка'
                    }
                    color={
                      transaction.status === 'completed' ? 'success' :
                      transaction.status === 'pending' ? 'info' : 'error'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                <KeyboardArrowRight color="action" />
              </TransactionItem>
            ))}
          </List>
        ) : (
          <EmptyStateBox>
            <History fontSize="large" />
            <Typography variant="h6" gutterBottom>
              Нет транзакций
            </Typography>
            <Typography variant="body2" color="textSecondary">
              У вас пока нет {
                tabValue === 1 ? 'пополнений баланса' : 
                tabValue === 2 ? 'покупок билетов' : 'транзакций'
              }
            </Typography>
            {tabValue === 0 || tabValue === 1 ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                sx={{ mt: 2, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                onClick={handleOpenTopupDialog}
              >
                Пополнить баланс
              </Button>
            ) : null}
          </EmptyStateBox>
        )}
      </TransactionsList>
      
      {/* Диалог пополнения баланса */}
      <TopupDialog
        open={openTopupDialog}
        onClose={handleCloseTopupDialog}
        fullWidth
      >
        <DialogHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Пополнение баланса</Typography>
            <IconButton edge="end" onClick={handleCloseTopupDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogHeader>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Введите сумму пополнения или выберите из предложенных вариантов:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
            {quickAmounts.map((amount) => (
              <AmountButton
                key={amount}
                onClick={() => setTopupAmount(amount.toString())}
                variant={topupAmount === amount.toString() ? 'contained' : 'outlined'}
                color={topupAmount === amount.toString() ? 'primary' : 'inherit'}
              >
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  maximumFractionDigits: 0
                }).format(amount)}
              </AmountButton>
            ))}
          </Box>
          
          <TextField
            fullWidth
            label="Сумма пополнения"
            variant="outlined"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  ₽
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            error={!!paymentError}
            helperText={paymentError}
          />
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Выберите способ оплаты:
          </Typography>
          
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={handlePaymentMethodChange}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseTopupDialog}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            color="primary"
            disabled={isProcessingPayment || !topupAmount}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            startIcon={isProcessingPayment ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isProcessingPayment ? 'Обработка...' : 'Пополнить'}
          </Button>
        </DialogActions>
      </TopupDialog>
    </WalletContainer>
  );
};

export default WalletPage; 