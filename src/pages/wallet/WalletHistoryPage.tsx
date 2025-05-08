import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Avatar,
  Chip,
  Container,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
  History
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  maxWidth: '100%',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const TransactionsList = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'light'
    ? '0 5px 25px rgba(0, 0, 0, 0.05)'
    : '0 5px 25px rgba(0, 0, 0, 0.1)',
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

const TransactionAmount = styled('div')(({ theme }) => ({
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
  fontSize: '0.75rem',
  height: 24,
  fontWeight: 600,
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

// Transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'purchase';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
}

const WalletHistoryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, getUserTransactions } = useFirebase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const transactionsData = await getUserTransactions(user.uid);
        
        const formattedTransactions: Transaction[] = transactionsData.map(data => ({
          id: data.id,
          type: data.type,
          amount: data.amount,
          status: data.status,
          date: data.createdAt.toDate(),
          description: data.description,
        }));

        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, getUserTransactions]);

  const handleBack = () => {
    navigate('/wallet');
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader>
          <IconButton 
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={700}>
            История транзакций
          </Typography>
        </PageHeader>

        <TransactionsList>
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : transactions.length > 0 ? (
            <List disablePadding>
              {transactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id}
                  divider
                >
                  <TransactionIcon className={transaction.type}>
                    {transaction.type === 'deposit' ? <ArrowUpward /> : <ArrowDownward />}
                  </TransactionIcon>
                  
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="span" fontWeight={600}>
                        {transaction.description}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" component="span" color="textSecondary">
                        {format(transaction.date, 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </Typography>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <TransactionAmount className={transaction.type}>
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
                </TransactionItem>
              ))}
            </List>
          ) : (
            <EmptyStateBox>
              <History fontSize="large" />
              <Typography variant="h6" component="div" gutterBottom>
                Нет транзакций
              </Typography>
              <Typography variant="body2" component="div" color="textSecondary">
                У вас пока нет транзакций в истории
              </Typography>
            </EmptyStateBox>
          )}
        </TransactionsList>
      </motion.div>
    </PageContainer>
  );
};

export default WalletHistoryPage; 