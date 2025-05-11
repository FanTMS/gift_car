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
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Refresh,
  Visibility,
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  MoreHoriz,
  Money,
  AccountBalanceWallet,
  Receipt
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';
import { Transaction, User } from '../../types';
import { SelectChangeEvent } from '@mui/material/Select';

const TablePaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  borderRadius: theme.spacing(1),
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const TransactionsManager: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Загрузка транзакций при монтировании компонента
  useEffect(() => {
    loadTransactions();
  }, [page, rowsPerPage, statusFilter, typeFilter, dateFromFilter, dateToFilter]);
  
  // Функция загрузки транзакций
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Создаем запрос на получение транзакций
      const transactionsCollection = collection(db, 'transactions');
      
      // Базовый запрос
      let transactionsQuery = query(
        transactionsCollection,
        orderBy('createdAt', 'desc'),
        limit(rowsPerPage)
      );
      
      // Добавляем фильтр по статусу
      if (statusFilter !== 'all') {
        transactionsQuery = query(
          transactionsCollection,
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc'),
          limit(rowsPerPage)
        );
      }
      
      // Добавляем фильтр по типу
      if (typeFilter !== 'all') {
        transactionsQuery = query(
          transactionsCollection,
          where('type', '==', typeFilter),
          orderBy('createdAt', 'desc'),
          limit(rowsPerPage)
        );
      }
      
      // Получаем данные
      const snapshot = await getDocs(transactionsQuery);
      
      // Устанавливаем общее количество транзакций
      setTotalTransactions(snapshot.size);
      
      // Преобразуем данные
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      // Фильтруем по дате если установлены фильтры
      let filteredData = transactionsData;
      
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter);
        filteredData = filteredData.filter(transaction => {
          const transactionDate = transaction.createdAt?.toDate();
          return transactionDate && transactionDate >= fromDate;
        });
      }
      
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        // Устанавливаем конец дня
        toDate.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(transaction => {
          const transactionDate = transaction.createdAt?.toDate();
          return transactionDate && transactionDate <= toDate;
        });
      }
      
      setTransactions(filteredData);
    } catch (error) {
      console.error('Ошибка при загрузке транзакций:', error);
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
  
  // Обработчик изменения фильтра статуса
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Обработчик изменения фильтра типа
  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setSearchQuery('');
    setPage(0);
  };
  
  // Обработчик поиска
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadTransactions();
      return;
    }
    
    // Фильтруем локально по описанию или ID пользователя
    const filtered = transactions.filter(transaction => 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setTransactions(filtered);
  };
  
  // Функция открытия диалога просмотра транзакции
  const handleViewTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
    
    // Загружаем данные пользователя
    try {
      const userDoc = await getDoc(doc(db, 'users', transaction.userId));
      if (userDoc.exists()) {
        setSelectedUser({
          id: userDoc.id,
          ...userDoc.data()
        } as User);
      } else {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      setSelectedUser(null);
    }
  };
  
  // Функция закрытия диалога просмотра транзакции
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedTransaction(null);
    setSelectedUser(null);
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
  
  // Функция получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Функция получения иконки типа транзакции
  const getTypeIcon = (type: string | undefined) => {
    switch (type) {
      case 'deposit':
        return <Money sx={{ color: theme.palette.success.main }} />;
      case 'withdrawal':
        return <AccountBalanceWallet sx={{ color: theme.palette.error.main }} />;
      case 'purchase':
        return <Receipt sx={{ color: theme.palette.primary.main }} />;
      default:
        return <MoreHoriz />;
    }
  };
  
  // Функция получения названия типа транзакции
  const getTypeName = (type: string | undefined) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'withdrawal':
        return 'Снятие';
      case 'purchase':
        return 'Покупка';
      default:
        return 'Неизвестно';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Управление транзакциями
        </Typography>
        <Tooltip title="Обновить данные">
          <IconButton color="primary" onClick={loadTransactions} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <FilterPaper>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' } }}>
            <TextField
              fullWidth
              label="Поиск"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                label="Статус"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="completed">Выполнено</MenuItem>
                <MenuItem value="pending">В обработке</MenuItem>
                <MenuItem value="failed">Ошибка</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип</InputLabel>
              <Select
                value={typeFilter}
                label="Тип"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">Все типы</MenuItem>
                <MenuItem value="deposit">Пополнение</MenuItem>
                <MenuItem value="withdrawal">Снятие</MenuItem>
                <MenuItem value="purchase">Покупка</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <TextField
              fullWidth
              label="Дата от"
              type="date"
              variant="outlined"
              size="small"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' } }}>
            <TextField
              fullWidth
              label="Дата до"
              type="date"
              variant="outlined"
              size="small"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 10%' } }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleResetFilters}
            >
              Сброс
            </Button>
          </Box>
        </Box>
      </FilterPaper>
      
      <TablePaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary">
                      Транзакции не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.userId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(transaction.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getTypeName(transaction.type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: transaction.type === 'deposit' 
                            ? theme.palette.success.main 
                            : transaction.type === 'withdrawal' 
                              ? theme.palette.error.main
                              : 'inherit'
                        }}
                      >
                        {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                        {transaction.amount.toLocaleString()} ₽
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        size="small"
                        label={
                          transaction.status === 'completed' ? 'Выполнено' :
                          transaction.status === 'pending' ? 'В обработке' :
                          'Ошибка'
                        }
                        color={getStatusColor(transaction.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalTransactions}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TablePaper>
      
      {/* Диалог просмотра транзакции */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 2, color: 'primary.main' }} />
            Детали транзакции
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedTransaction && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ID транзакции
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    {selectedTransaction.id}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Тип
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getTypeIcon(selectedTransaction.type)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {getTypeName(selectedTransaction.type)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Сумма
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      color: selectedTransaction.type === 'deposit' 
                        ? theme.palette.success.main 
                        : selectedTransaction.type === 'withdrawal' 
                          ? theme.palette.error.main
                          : 'inherit'
                    }}
                  >
                    {selectedTransaction.type === 'deposit' ? '+' : selectedTransaction.type === 'withdrawal' ? '-' : ''}
                    {selectedTransaction.amount.toLocaleString()} ₽
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Статус
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <StatusChip
                      label={
                        selectedTransaction.status === 'completed' ? 'Выполнено' :
                        selectedTransaction.status === 'pending' ? 'В обработке' :
                        'Ошибка'
                      }
                      color={getStatusColor(selectedTransaction.status)}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Пользователь
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser ? (
                      <>
                        {selectedUser.displayName || 'Без имени'}<br />
                        <Typography variant="body2" color="textSecondary">
                          ID: {selectedTransaction.userId}
                        </Typography>
                      </>
                    ) : (
                      selectedTransaction.userId
                    )}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Дата создания
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedTransaction.createdAt)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Дата завершения
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTransaction.completedAt 
                      ? formatDate(selectedTransaction.completedAt)
                      : 'Не завершено'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Способ оплаты
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTransaction.paymentMethod}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Описание
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTransaction.description || 'Нет описания'}
                  </Typography>
                  
                  {selectedTransaction.raffleId && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary">
                        Связанный розыгрыш
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace' }}>
                        {selectedTransaction.raffleId}
                      </Typography>
                    </>
                  )}
                  
                  {selectedTransaction.metadata && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary">
                        Дополнительные данные
                      </Typography>
                      <Typography
                        variant="body1"
                        component="pre"
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          overflowX: 'auto'
                        }}
                      >
                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={handleCloseViewDialog}
            color="primary"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsManager; 