import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  TablePagination,
  useTheme
} from '@mui/material';
import {
  Add,
  Remove,
  AccountBalanceWallet,
  History,
  Search,
  Refresh
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc, addDoc, Timestamp, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';
import { User, Transaction } from '../../types';

const TablePaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
}));

const WalletCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
  }
}));

const ScrollableBox = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#bbb',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#999',
  },
}));

interface UserWithBalance extends User {
  balance: number;
}

const WalletsManager: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Загрузка пользователей при монтировании компонента
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);
  
  // Функция загрузки пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Создаем запрос на получение пользователей
      const usersCollection = collection(db, 'users');
      
      // Получаем общее количество пользователей для пагинации
      const countQuery = query(usersCollection);
      const countSnapshot = await getDocs(countQuery);
      setTotalUsers(countSnapshot.size);
      
      // Создаем запрос с пагинацией
      const userQuery = query(
        usersCollection,
        orderBy('displayName'),
        limit(rowsPerPage)
      );
      
      const usersSnapshot = await getDocs(userQuery);
      
      // Преобразуем результаты в массив пользователей
      const usersData = await Promise.all(
        usersSnapshot.docs.map(async (docSnapshot) => {
          const userData = docSnapshot.data() as User;
          return {
            ...userData,
            id: docSnapshot.id,
            balance: userData.balance || 0
          };
        })
      );
      
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик изменения страницы пагинации
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Обработчик изменения количества строк на странице
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Функция поиска пользователей
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    
    try {
      setLoading(true);
      
      // Создаем запрос для поиска по имени или email
      const usersCollection = collection(db, 'users');
      
      // Поиск по displayName
      const nameQuery = query(
        usersCollection,
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );
      
      // Поиск по email
      const emailQuery = query(
        usersCollection,
        where('email', '>=', searchQuery),
        where('email', '<=', searchQuery + '\uf8ff')
      );
      
      // Выполняем оба запроса
      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery)
      ]);
      
      // Объединяем результаты без дубликатов
      const uniqueUsers = new Map<string, UserWithBalance>();
      
      // Добавляем результаты поиска по имени
      nameSnapshot.docs.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;
        uniqueUsers.set(docSnapshot.id, {
          ...userData,
          id: docSnapshot.id,
          balance: userData.balance || 0
        });
      });
      
      // Добавляем результаты поиска по email
      emailSnapshot.docs.forEach((docSnapshot) => {
        if (!uniqueUsers.has(docSnapshot.id)) {
          const userData = docSnapshot.data() as User;
          uniqueUsers.set(docSnapshot.id, {
            ...userData,
            id: docSnapshot.id,
            balance: userData.balance || 0
          });
        }
      });
      
      // Преобразуем Map в массив
      const usersData = Array.from(uniqueUsers.values());
      
      setUsers(usersData);
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Функция открытия диалога баланса
  const handleOpenBalanceDialog = (user: UserWithBalance) => {
    setSelectedUser(user);
    setBalanceDialogOpen(true);
    setAmount('');
    setOperation('add');
    setNote('');
    loadUserTransactions(user.id);
  };
  
  // Функция закрытия диалога баланса
  const handleCloseBalanceDialog = () => {
    setBalanceDialogOpen(false);
    setSelectedUser(null);
    setTransactions([]);
  };
  
  // Функция загрузки транзакций пользователя
  const loadUserTransactions = async (userId: string) => {
    try {
      setTransactionsLoading(true);
      
      // Создаем запрос для получения транзакций пользователя
      const transactionsCollection = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      // Преобразуем результаты в массив транзакций
      const transactionsData = transactionsSnapshot.docs.map((docSnapshot) => {
        const transactionData = docSnapshot.data() as Transaction;
        return {
          ...transactionData,
          id: docSnapshot.id
        };
      });
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Ошибка при загрузке транзакций:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };
  
  // Функция обновления баланса пользователя
  const handleUpdateBalance = async () => {
    if (!selectedUser || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Получаем текущий документ пользователя
      const userDocRef = doc(db, 'users', selectedUser.id);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Пользователь не найден');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;
      const amountValue = parseFloat(amount);
      
      // Вычисляем новый баланс
      let newBalance = currentBalance;
      if (operation === 'add') {
        newBalance = currentBalance + amountValue;
      } else {
        newBalance = Math.max(0, currentBalance - amountValue);
      }
      
      // Обновляем баланс пользователя
      await updateDoc(userDocRef, {
        balance: newBalance,
        updatedAt: Timestamp.now()
      });
      
      // Создаем транзакцию
      const transactionData = {
        userId: selectedUser.id,
        amount: amountValue,
        operation: operation,
        status: 'completed',
        description: operation === 'add' 
          ? `Пополнение баланса администратором: ${note}`
          : `Списание с баланса администратором: ${note}`,
        paymentMethod: 'admin_panel',
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        type: operation === 'add' ? 'deposit' : 'withdrawal',
        metadata: {
          adminAction: true,
          note: note
        }
      };
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      // Обновляем состояние пользователя в интерфейсе
      setSelectedUser({
        ...selectedUser,
        balance: newBalance
      });
      
      // Обновляем список пользователей
      setUsers(users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            balance: newBalance
          };
        }
        return user;
      }));
      
      // Обновляем список транзакций
      loadUserTransactions(selectedUser.id);
      
      // Сбрасываем форму
      setAmount('');
      setNote('');
    } catch (error) {
      console.error('Ошибка при обновлении баланса:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Функция форматирования даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Неизвестно';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Некорректная дата';
    }
  };
  
  // Функция получения статуса транзакции
  const getTransactionStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip size="small" color="success" label="Выполнено" />;
      case 'pending':
        return <Chip size="small" color="warning" label="В обработке" />;
      case 'failed':
        return <Chip size="small" color="error" label="Ошибка" />;
      default:
        return <Chip size="small" color="default" label={status} />;
    }
  };
  
  // Функция получения типа транзакции
  const getTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Chip size="small" color="info" label="Пополнение" />;
      case 'withdrawal':
        return <Chip size="small" color="secondary" label="Списание" />;
      case 'purchase':
        return <Chip size="small" color="primary" label="Покупка" />;
      default:
        return <Chip size="small" color="default" label={type} />;
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Управление кошельками пользователей
        </Typography>
        <Tooltip title="Обновить данные">
          <IconButton color="primary" onClick={loadUsers} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Поиск пользователя"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mr: 2, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
        >
          Найти
        </Button>
      </Box>
      
      <TablePaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Идентификатор</TableCell>
                <TableCell>Баланс</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">
                      {searchQuery ? 'Пользователи не найдены' : 'Нет данных о пользователях'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={user.photoURL || ''}
                          alt={user.displayName || ''}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.displayName || 'Безымянный пользователь'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email || (user.telegramId ? `Telegram: ${user.telegramId}` : 'Нет контактных данных')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: user.balance > 0 ? 'success.main' : 'text.secondary',
                          fontWeight: 600
                        }}
                      >
                        {user.balance.toLocaleString()} ₽
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AccountBalanceWallet />}
                        onClick={() => handleOpenBalanceDialog(user)}
                        size="small"
                      >
                        Управление балансом
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TablePaper>
      
      {/* Диалог управления балансом */}
      <Dialog
        open={balanceDialogOpen}
        onClose={handleCloseBalanceDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWallet sx={{ mr: 2, color: 'primary.main' }} />
            Управление балансом пользователя
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedUser && (
            <>
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05), 
                borderRadius: 2, 
                mb: 3 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={selectedUser.photoURL || ''}
                    alt={selectedUser.displayName || ''}
                    sx={{ mr: 2, width: 40, height: 40 }}
                  >
                    {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedUser.displayName || 'Безымянный пользователь'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedUser.email || (selectedUser.telegramId ? `Telegram: ${selectedUser.telegramId}` : 'Нет контактных данных')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body1">Текущий баланс:</Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: selectedUser.balance > 0 ? 'success.main' : 'text.secondary',
                      fontWeight: 600
                    }}
                  >
                    {selectedUser.balance.toLocaleString()} ₽
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Изменение баланса
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Button
                    variant={operation === 'add' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<Add />}
                    onClick={() => setOperation('add')}
                    sx={{ mr: 1, flexGrow: 1 }}
                  >
                    Пополнить
                  </Button>
                  <Button
                    variant={operation === 'subtract' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<Remove />}
                    onClick={() => setOperation('subtract')}
                    sx={{ flexGrow: 1 }}
                  >
                    Списать
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  label="Сумма"
                  variant="outlined"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Примечание"
                  variant="outlined"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Укажите причину изменения баланса"
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                История транзакций
              </Typography>
              
              <ScrollableBox>
                {transactionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : transactions.length === 0 ? (
                  <Typography color="textSecondary" align="center" sx={{ my: 3 }}>
                    Нет данных о транзакциях
                  </Typography>
                ) : (
                  transactions.map((transaction) => (
                    <WalletCard key={transaction.id}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {transaction.description || 'Транзакция'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(transaction.createdAt)}
                          </Typography>
                          {getTransactionStatus(transaction.status)}
                          {transaction.type && getTransactionType(transaction.type)}
                        </Box>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: transaction.type === 'deposit' ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} ₽
                      </Typography>
                    </WalletCard>
                  ))
                )}
              </ScrollableBox>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseBalanceDialog} color="inherit">
            Закрыть
          </Button>
          <Button
            variant="contained"
            color={operation === 'add' ? 'success' : 'error'}
            onClick={handleUpdateBalance}
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : operation === 'add' ? <Add /> : <Remove />}
          >
            {operation === 'add' ? 'Пополнить баланс' : 'Списать с баланса'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletsManager; 