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
  SwipeableDrawer,
  useMediaQuery,
  Badge
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
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
  ReceiptLong,
  CheckCircleOutline,
  ErrorOutline,
  AccessTime,
  MoreHoriz
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
import TonConnectComponent from '../components/wallet/TonConnectComponent';
import { TonPaymentService } from '../services/payment/TonPaymentService';
import TonConnectService from '../services/TonConnectService';

// TON logo in base64
const tonLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzAzODhDQyIvPgo8cGF0aCBkPSJNMTYuNjA5MSAxOS41ODIzTDI1LjEyNTIgMTYuMDIzOUwyMS45Njc1IDI0LjIzMDVMMTYuNjA5MSAxOS41ODIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyMkwyMC43NzAzIDEzLjMwNDdMMjUuMTI1MSAxNi4wMjM5TDE2LjYwOTEgMTkuNTgyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMy45MTAyIDI2LjA4NjNMMTYuNjA5MSAxOS41ODIzTDIxLjk2NzUgMjQuMjMwNUwxMy45MTAyIDI2LjA4NjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTMuOTEwMiAyNi4wODYzTDEzLjc3NzMgMTguMjg5NkwxNi42MDkxIDE5LjU4MjNMMTMuOTEwMiAyNi4wODYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyM0wxMy43NzczIDE4LjI4OTZMMjAuNzcwMyAxMy4zMDQ3TDE2LjYwOTEgMTkuNTgyM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

// Modern styled components with adaptive design
const WalletContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  maxWidth: '100%',
  [theme.breakpoints.up('sm')]: {
    paddingTop: theme.spacing(4),
  },
}));

const WalletCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.95)} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 82, 204, 0.2), 0 5px 15px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 180,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    minHeight: 150,
  },
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

const BalanceTextWrapper = styled(Box)(({ theme }) => ({
  fontSize: '2.25rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
  '& .currency': {
    fontSize: '1.5rem',
    opacity: 0.8,
    marginLeft: theme.spacing(0.5),
    alignSelf: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
    },
  }
}));

const CardPattern = styled(Box)(() => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '60%',
  height: '100%',
  background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
  zIndex: 0,
}));

const CardCircle = styled(Box)(() => ({
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  zIndex: 0,
}));

const CardCircleSmall = styled(Box)(() => ({
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
  width: 44,
  height: 44,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  backdropFilter: 'blur(5px)',
  [theme.breakpoints.down('sm')]: {
    width: 38,
    height: 38,
    top: 16,
    right: 16,
  },
  '& svg': {
    color: 'white',
    fontSize: 22,
    [theme.breakpoints.down('sm')]: {
      fontSize: 20,
    },
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1.25, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  fontSize: '0.95rem',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: '0.875rem',
  },
  '&:hover': {
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  }
}));

const TransactionsList = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },
}));

const TransactionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 3),
  },
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

const TransactionIcon = styled(Avatar)(({ theme }) => ({
  width: 42,
  height: 42,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: 38,
    height: 38,
    marginRight: theme.spacing(1.5),
  },
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
  fontSize: '0.95rem',
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
  fontSize: '0.7rem',
  height: 22,
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.75rem',
    height: 24,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    minHeight: 48,
    padding: theme.spacing(1.2, 2),
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.95rem',
      padding: theme.spacing(1.5, 2.5),
    },
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
  padding: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6),
  },
  textAlign: 'center',
  '& svg': {
    fontSize: 56,
    marginBottom: theme.spacing(2),
    color: alpha(theme.palette.text.secondary, 0.5),
    [theme.breakpoints.up('sm')]: {
      fontSize: 64,
    },
  }
}));

const TopupDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(2),
    maxWidth: 480,
    width: '100%',
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      maxWidth: 'calc(100% - 32px)',
    },
  }
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3, 3, 2),
  },
  '& .MuiTypography-root': {
    fontWeight: 700,
    fontSize: '1.2rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.25rem',
    },
  }
}));

const AmountButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(0.75, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1, 3),
  },
  fontWeight: 600,
  textTransform: 'none',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    borderColor: theme.palette.primary.main,
  }
}));

const TonConnectPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.primary.light, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 180,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(3),
    minHeight: 180,
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: 150,
  },
}));

// Transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'purchase';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
  paymentMethod?: PaymentMethod;
}

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState<boolean>(false);
  const [tonWalletConnected, setTonWalletConnected] = useState<boolean>(false);
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [tonWalletError, setTonWalletError] = useState<string | null>(null);
  const [openTonTopupDialog, setOpenTonTopupDialog] = useState<boolean>(false);
  const [tonTopupAmount, setTonTopupAmount] = useState<string>('');
  const [isProcessingTonPayment, setIsProcessingTonPayment] = useState<boolean>(false);
  const [tonPaymentError, setTonPaymentError] = useState<string | null>(null);
  const [tonToRubRate, setTonToRubRate] = useState<number>(270); // Approximate TON to RUB rate
  
  // Check if the app is running in Telegram
  useEffect(() => {
    const checkTelegramWebApp = () => {
      // @ts-ignore - ignore TypeScript errors for Telegram API
      const isTelegram = Boolean(window?.Telegram?.WebApp);
      setIsTelegramMiniApp(isTelegram);
      
      // If in Telegram, check TON wallet connection
      if (isTelegram && user) {
        try {
          // Use centralized service to check connection
          const tonConnectService = TonConnectService.getInstance();
          
          // If already connected, get address
          if (tonConnectService.isConnected()) {
            const address = tonConnectService.getWalletAddress();
            if (address) {
              setTonWalletConnected(true);
              setTonWalletAddress(address);
            }
          }
        } catch (error) {
          console.error('Error checking TON wallet connection:', error);
        }
      }
    };
    
    checkTelegramWebApp();
  }, [user]);

  // Load balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Get user balance data from Firebase
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBalance(userData.balance || 0);
          }

          // Get user transactions from Firebase
          const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
          
          const transactionsSnapshot = await getDocs(q);
          const transactionsData = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date() // Convert Timestamp to Date
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

  // Topup dialog handlers
  const handleOpenTopupDialog = () => {
    setOpenTopupDialog(true);
    setTopupAmount('');
    setPaymentError(null);
  };

  const handleCloseTopupDialog = () => {
    setOpenTopupDialog(false);
  };

  // Show TON option only if wallet is connected and we're in Telegram Mini App
  const showTonOption = tonWalletConnected && isTelegramMiniApp;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // If TON wallet is selected, open special dialog
    if (method === 'ton_wallet') {
      handleCloseTopupDialog();
      setTimeout(() => {
        handleOpenTonTopupDialog();
      }, 300);
    }
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
      
      // Get Telegram user ID if mini-app is launched through Telegram
      let additionalMetadata = { operation: 'wallet_topup' };
      
      // If this is a Telegram app and Telegram payment method is selected
      if (isTelegramMiniApp && paymentMethod === 'telegram_wallet') {
        // @ts-ignore - ignore TypeScript errors for Telegram API
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
          // @ts-ignore - ignore TypeScript errors for Telegram API
          additionalMetadata.telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
      }
      
      const result = await PaymentProcessorService.processPayment(
        paymentMethod,
        amount,
        'Пополнение баланса',
        user?.uid,
        additionalMetadata
      );
      
      if (!result.success) {
        setPaymentError(result.error || 'Ошибка при инициализации платежа');
        setIsProcessingPayment(false);
      }
      // For successful payments, redirection happens in the processPayment service
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Произошла ошибка при обработке платежа');
      setIsProcessingPayment(false);
    }
  };

  // Predefined amounts for quick topup
  const quickAmounts = [500, 1000, 3000, 5000];

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Animation variants for card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }
    }
  };

  // Filter transactions based on selected tab
  const filteredTransactions = transactions.filter(transaction => {
    if (tabValue === 0) return true; // All transactions
    if (tabValue === 1) return transaction.type === 'deposit'; // Deposits only
    if (tabValue === 2) return transaction.type === 'purchase'; // Purchases only
    return true;
  });

  // TonConnect handlers
  const handleTonWalletConnected = (walletAddress: string) => {
    console.log('TON wallet connected:', walletAddress);
    setTonWalletConnected(true);
    setTonWalletAddress(walletAddress);
    setTonWalletError(null);
  };
  
  const handleTonWalletError = (error: string) => {
    console.error('TON wallet error:', error);
    setTonWalletError(error);
  };

  // TON topup handlers
  const handleOpenTonTopupDialog = () => {
    setOpenTonTopupDialog(true);
    setTonTopupAmount('');
    setTonPaymentError(null);
  };

  const handleCloseTonTopupDialog = () => {
    setOpenTonTopupDialog(false);
  };

  // Function to convert TON to rubles
  const calculateRubAmount = (tonAmount: string): number => {
    const amountTon = parseFloat(tonAmount) || 0;
    return Math.floor(amountTon * tonToRubRate);
  };

  // TON payment handler
  const handleProcessTonPayment = async () => {
    if (!tonTopupAmount || isNaN(parseFloat(tonTopupAmount)) || parseFloat(tonTopupAmount) <= 0) {
      setTonPaymentError('Пожалуйста, введите корректную сумму');
      return;
    }
    
    setIsProcessingTonPayment(true);
    setTonPaymentError(null);
    
    try {
      if (!user) {
        throw new Error('Необходимо авторизоваться');
      }
      
      const amountTon = parseFloat(tonTopupAmount);
      
      // Check if TON wallet is connected
      if (!tonWalletConnected) {
        throw new Error('TON кошелек не подключен');
      }
      
      // Send TON transaction
      const result = await TonPaymentService.topUpBalance(user.uid, amountTon);
      
      if (result.success) {
        setOpenTonTopupDialog(false);
        // Update page data
        window.location.reload();
      } else {
        setTonPaymentError(result.error || 'Ошибка при обработке TON транзакции');
      }
    } catch (error) {
      console.error('TON payment error:', error);
      setTonPaymentError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsProcessingTonPayment(false);
    }
  };

  // Predefined amounts for quick topup in TON
  const quickTonAmounts = [0.1, 0.5, 1, 5];
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get appropriate status icon based on transaction status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircleOutline fontSize="small" />;
      case 'pending':
        return <AccessTime fontSize="small" />;
      case 'failed':
        return <ErrorOutline fontSize="small" />;
      default:
        return <MoreHoriz fontSize="small" />;
    }
  };

  return (
    <WalletContainer maxWidth="md">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
        <Box sx={{ width: '100%', px: 1, mb: 2, flexBasis: { xs: '100%', md: '50%' }, height: '100%' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{ height: '100%' }}
          >
            <WalletCard elevation={6}>
              <CardPattern />
              <CardCircle />
              <CardCircleSmall />
              <WalletIcon>
                <AccountBalanceWallet />
              </WalletIcon>
              
              <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.95, mb: 0.5 }}>
                  Ваш баланс
                </Typography>
                
                <BalanceTextWrapper>
                  {new Intl.NumberFormat('ru-RU', {
                    maximumFractionDigits: 0
                  }).format(balance)}
                  <span className="currency">₽</span>
                </BalanceTextWrapper>
                
                <Box sx={{ display: 'flex', mt: 'auto', pt: 2 }}>
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    startIcon={!isMobile && <AddCircleOutline />}
                    onClick={handleOpenTopupDialog}
                    fullWidth
                    sx={{ mr: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {isMobile ? <AddCircleOutline /> : 'Пополнить'}
                  </ActionButton>
                  
                  <ActionButton
                    variant="contained"
                    color="primary"
                    sx={{ backgroundColor: 'white', color: theme.palette.primary.main }}
                    startIcon={!isMobile && <Receipt />}
                    fullWidth
                    onClick={() => navigate('/wallet/history')}
                  >
                    {isMobile ? <Receipt /> : 'История'}
                  </ActionButton>
                </Box>
              </Box>
            </WalletCard>
          </motion.div>
        </Box>
        
        {isTelegramMiniApp && (
          <Box sx={{ width: '100%', px: 1, mb: 2, flexBasis: { xs: '100%', md: '50%' }, height: '100%' }}>
            {tonWalletConnected ? (
              <TonConnectPaper>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1), 
                        color: theme.palette.primary.main, 
                        width: 38, 
                        height: 38, 
                        mr: 1.5
                      }}
                    >
                      <img 
                        src={tonLogoBase64} 
                        alt="TON" 
                        style={{ width: 20, height: 20 }} 
                      />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        TON Кошелек
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {tonWalletAddress && `${tonWalletAddress.slice(0, 6)}...${tonWalletAddress.slice(-6)}`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', width: '100%', justifyContent: 'center', pt: 2 }}>
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      onClick={handleOpenTonTopupDialog}
                      startIcon={<AddCircleOutline />}
                      sx={{ 
                        borderRadius: theme.spacing(5),
                        textTransform: 'none',
                        fontWeight: 600,
                        width: '100%',
                        maxWidth: '250px'
                      }}
                    >
                      {isMobile ? 'Пополнить TON' : 'Пополнить через TON'}
                    </ActionButton>
                  </Box>
                </Box>
              </TonConnectPaper>
            ) : (
              <Box sx={{ height: '100%' }}>
                <TonConnectComponent 
                  onSuccessConnect={handleTonWalletConnected}
                  onError={handleTonWalletError}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      <StyledTabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        variant="fullWidth"
        sx={{ mt: 2 }}
      >
        <Tab label={isMobile ? "Все" : "Все операции"} />
        <Tab label={isMobile ? "Пополнения" : "Пополнения"} />
        <Tab label={isMobile ? "Покупки" : "Покупки"} />
      </StyledTabs>
      
      <TransactionsList>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={isMobile ? 32 : 40} />
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
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                      {transaction.description}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                      {format(transaction.date, isMobile ? 'dd.MM.yyyy, HH:mm' : 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: isMobile ? 80 : 100 }}>
                  <TransactionAmount variant="subtitle2" className={transaction.type} sx={{ fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
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
                    icon={getStatusIcon(transaction.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                {!isMobile && <KeyboardArrowRight color="action" />}
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
                sx={{ mt: 2, borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
                onClick={handleOpenTopupDialog}
              >
                Пополнить баланс
              </Button>
            ) : null}
          </EmptyStateBox>
        )}
      </TransactionsList>
      
      {/* Topup dialog */}
      <TopupDialog
        open={openTopupDialog}
        onClose={handleCloseTopupDialog}
        fullWidth
        TransitionComponent={SlideTransition}
      >
        <DialogHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Пополнение баланса</Typography>
            <IconButton edge="end" onClick={handleCloseTopupDialog} size={isMobile ? 'small' : 'medium'}>
              <Close />
            </IconButton>
          </Box>
        </DialogHeader>
        
        <DialogContent sx={{ p: 2, pt: 1, [theme.breakpoints.up('sm')]: { p: 3, pt: 1 } }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Введите сумму пополнения:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            {quickAmounts.map((amount) => (
              <AmountButton
                key={amount}
                onClick={() => setTopupAmount(amount.toString())}
                variant={topupAmount === amount.toString() ? 'contained' : 'outlined'}
                color={topupAmount === amount.toString() ? 'primary' : 'inherit'}
                size={isMobile ? 'small' : 'medium'}
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
            showTonOption={showTonOption}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0, [theme.breakpoints.up('sm')]: { p: 3, pt: 0 } }}>
          <Button
            onClick={handleCloseTopupDialog}
            variant="outlined"
            color="inherit"
            size={isMobile ? 'small' : 'medium'}
            sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            color="primary"
            disabled={isProcessingPayment || !topupAmount}
            size={isMobile ? 'small' : 'medium'}
            sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
            startIcon={isProcessingPayment ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : null}
          >
            {isProcessingPayment ? 'Обработка...' : 'Пополнить'}
          </Button>
        </DialogActions>
      </TopupDialog>
      
      {/* TON topup dialog */}
      <TopupDialog
        open={openTonTopupDialog}
        onClose={handleCloseTonTopupDialog}
        fullWidth
        TransitionComponent={SlideTransition}
      >
        <DialogHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Пополнение через TON</Typography>
            <IconButton edge="end" onClick={handleCloseTonTopupDialog} size={isMobile ? 'small' : 'medium'}>
              <Close />
            </IconButton>
          </Box>
        </DialogHeader>
        
        <DialogContent sx={{ p: 2, pt: 1, [theme.breakpoints.up('sm')]: { p: 3, pt: 1 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2 
          }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mr: 1.5
              }}
            >
              <img 
                src={tonLogoBase64} 
                alt="TON" 
                style={{ width: 22, height: 22 }} 
              />
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600}>
              Пополнение через TON Wallet
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Введите сумму в TON или выберите из предложенных вариантов:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            {quickTonAmounts.map((amount) => (
              <AmountButton
                key={amount}
                onClick={() => setTonTopupAmount(amount.toString())}
                variant={tonTopupAmount === amount.toString() ? 'contained' : 'outlined'}
                color={tonTopupAmount === amount.toString() ? 'primary' : 'inherit'}
                size={isMobile ? 'small' : 'medium'}
              >
                {amount} TON
              </AmountButton>
            ))}
          </Box>
          
          <TextField
            fullWidth
            label="Сумма пополнения"
            variant="outlined"
            value={tonTopupAmount}
            onChange={(e) => setTonTopupAmount(e.target.value)}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img 
                    src={tonLogoBase64} 
                    alt="TON" 
                    style={{ width: 16, height: 16 }} 
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  TON
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            error={!!tonPaymentError}
            helperText={tonPaymentError}
          />
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Примерная сумма в рублях:
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              maximumFractionDigits: 0
            }).format(calculateRubAmount(tonTopupAmount))}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            * Обмен происходит по текущему курсу 1 TON ≈ {tonToRubRate} ₽. Курс может меняться.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0, [theme.breakpoints.up('sm')]: { p: 3, pt: 0 } }}>
          <Button
            onClick={handleCloseTonTopupDialog}
            variant="outlined"
            color="inherit"
            size={isMobile ? 'small' : 'medium'}
            sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleProcessTonPayment}
            variant="contained"
            color="primary"
            disabled={isProcessingTonPayment || !tonTopupAmount}
            size={isMobile ? 'small' : 'medium'}
            sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
            startIcon={isProcessingTonPayment ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : null}
          >
            {isProcessingTonPayment ? 'Обработка...' : 'Пополнить через TON'}
          </Button>
        </DialogActions>
      </TopupDialog>
    </WalletContainer>
  );
};

export default WalletPage; 