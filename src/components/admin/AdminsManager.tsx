import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Snackbar,
  Alert,
  Divider,
  Grid,
  InputAdornment,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Edit,
  Check,
  Close,
  Search,
  SupervisorAccount,
  Business
} from '@mui/icons-material';
import { useFirebase } from '../../context/FirebaseContext';
import { Company, User } from '../../types';
import { 
  getAdmins, 
  getAllUsers, 
  findUserByTelegramId,
  assignAdminRole, 
  removeAdminRole 
} from '../../firebase/userServices';

interface AdminsManagerProps {
  isSuperAdmin?: boolean;
}

const AdminsManager: React.FC<AdminsManagerProps> = ({ isSuperAdmin }) => {
  const { companies } = useFirebase();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchMode, setSearchMode] = useState<'users' | 'telegramId'>('users');
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isSuperAdminRole, setIsSuperAdminRole] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Загрузка списка администраторов
  const loadAdmins = async () => {
    setLoading(true);
    try {
      const adminsList = await getAdmins();
      setAdmins(adminsList);
    } catch (error) {
      console.error("Ошибка при загрузке списка администраторов:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadAdmins();
  }, []);

  // Функция поиска пользователей
  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setSearchLoading(true);
    try {
      if (searchMode === 'users') {
        // Поиск среди всех пользователей
        const allUsers = await getAllUsers();
        const filteredUsers = allUsers.filter(user => 
          (user.displayName && user.displayName.toLowerCase().includes(searchValue.toLowerCase())) ||
          (user.username && user.username.toLowerCase().includes(searchValue.toLowerCase())) ||
          (user.telegramId && user.telegramId.includes(searchValue))
        );
        setSearchResults(filteredUsers);
      } else {
        // Поиск по Telegram ID
        const user = await findUserByTelegramId(searchValue);
        setSearchResults(user ? [user] : []);
      }
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      setNotification({
        type: 'error',
        message: 'Произошла ошибка при поиске пользователей'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Открытие диалога добавления администратора
  const handleOpenAddDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedCompany('');
    setIsSuperAdminRole(false);
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  // Назначение роли администратора
  const handleAssignAdmin = async () => {
    if (!selectedUser) return;
    
    try {
      const role = isSuperAdminRole ? 'superadmin' : 'admin';
      const companyId = !isSuperAdminRole && selectedCompany ? selectedCompany : undefined;
      
      const success = await assignAdminRole(selectedUser.id, role, companyId);
      
      if (success) {
        setNotification({
          type: 'success',
          message: `${selectedUser.displayName || 'Пользователь'} успешно назначен ${isSuperAdminRole ? 'супер-администратором' : 'администратором'}`
        });
        handleCloseDialog();
        loadAdmins(); // Перезагружаем список администраторов
      } else {
        setNotification({
          type: 'error',
          message: 'Не удалось назначить пользователя администратором'
        });
      }
    } catch (error) {
      console.error("Ошибка при назначении роли администратора:", error);
      setNotification({
        type: 'error',
        message: 'Произошла ошибка при назначении роли администратора'
      });
    }
  };

  // Удаление роли администратора
  const handleRemoveAdmin = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого администратора?')) {
      try {
        const success = await removeAdminRole(userId);
        
        if (success) {
          setNotification({
            type: 'success',
            message: 'Роль администратора успешно удалена'
          });
          loadAdmins(); // Перезагружаем список администраторов
        } else {
          setNotification({
            type: 'error',
            message: 'Не удалось удалить роль администратора'
          });
        }
      } catch (error) {
        console.error("Ошибка при удалении роли администратора:", error);
        setNotification({
          type: 'error',
          message: 'Произошла ошибка при удалении роли администратора'
        });
      }
    }
  };

  // Получение имени компании по ID
  const getCompanyName = (companyId: string | undefined) => {
    if (!companyId) return '';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : '';
  };

  return (
    <Box>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Управление администраторами
        </Typography>
        {isSuperAdmin && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => setSearchMode(searchMode === 'users' ? 'telegramId' : 'users')}
          >
            {searchMode === 'users' ? 'Поиск по Telegram ID' : 'Поиск по пользователям'}
          </Button>
        )}
      </Box>

      {/* Секция поиска (только для суперадминов) */}
      {isSuperAdmin && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {searchMode === 'users' 
              ? 'Поиск пользователей для назначения администратором' 
              : 'Поиск пользователя по Telegram ID'}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label={searchMode === 'users' ? "Имя пользователя или username" : "Telegram ID"}
              variant="outlined"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchLoading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={24} />
                  </InputAdornment>
                ) : null
              }}
              sx={{ mr: 2 }}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSearch}
              disabled={searchLoading || !searchValue.trim()}
            >
              Поиск
            </Button>
          </Box>

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Результаты поиска ({searchResults.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Пользователь</TableCell>
                      <TableCell>Telegram ID</TableCell>
                      <TableCell>Роль</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.photoURL || ''} sx={{ mr: 2 }}>
                              {user.displayName ? user.displayName[0] : 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">
                                {user.displayName || 'Без имени'}
                              </Typography>
                              {user.username && (
                                <Typography variant="body2" color="textSecondary">
                                  @{user.username}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.telegramId || 'Не указан'}</TableCell>
                        <TableCell>
                          {user.role ? (
                            <Chip 
                              color={user.role === 'superadmin' ? 'error' : 'primary'}
                              size="small" 
                              label={user.role === 'superadmin' ? 'Супер-админ' : (user.role === 'admin' ? 'Админ' : 'Пользователь')}
                            />
                          ) : (
                            <Chip size="small" label="Пользователь" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {user.role === 'admin' || user.role === 'superadmin' ? (
                            <Chip 
                              icon={<Check />} 
                              color="success" 
                              size="small" 
                              label="Уже администратор" 
                            />
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleOpenAddDialog(user)}
                            >
                              Назначить админом
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {searchValue && searchResults.length === 0 && !searchLoading && (
            <Alert severity="info">
              Пользователи не найдены. Попробуйте изменить запрос или способ поиска.
            </Alert>
          )}
        </Paper>
      )}

      {/* Список текущих администраторов */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Текущие администраторы ({admins.length})
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : admins.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Администратор</TableCell>
                  <TableCell>Telegram ID</TableCell>
                  <TableCell>Уровень доступа</TableCell>
                  <TableCell>Компания</TableCell>
                  {isSuperAdmin && <TableCell align="right">Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar src={admin.photoURL || ''} sx={{ mr: 2 }}>
                          {admin.displayName ? admin.displayName[0] : 'A'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {admin.displayName || 'Без имени'}
                          </Typography>
                          {admin.username && (
                            <Typography variant="body2" color="textSecondary">
                              @{admin.username}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{admin.telegramId || 'Не указан'}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={admin.role === 'superadmin' ? <SupervisorAccount /> : undefined}
                        color={admin.role === 'superadmin' ? 'error' : 'primary'}
                        size="small" 
                        label={admin.role === 'superadmin' ? 'Супер-администратор' : 'Администратор'}
                      />
                    </TableCell>
                    <TableCell>
                      {admin.role === 'superadmin' ? (
                        <Chip 
                          icon={<Check />}
                          color="success"
                          size="small" 
                          label="Полный доступ"
                        />
                      ) : admin.companyId ? (
                        <Chip 
                          icon={<Business />}
                          size="small" 
                          label={getCompanyName(admin.companyId)}
                        />
                      ) : (
                        'Не указана'
                      )}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell align="right">
                        <IconButton 
                          color="error"
                          onClick={() => handleRemoveAdmin(admin.id)}
                          disabled={admin.id === localStorage.getItem('currentUserId')} // Предотвращаем удаление себя
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Администраторы не найдены.
          </Alert>
        )}
      </Paper>

      {/* Диалог добавления администратора */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Назначение администратором
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar src={selectedUser.photoURL || ''} sx={{ width: 56, height: 56, mr: 2 }}>
                  {selectedUser.displayName ? selectedUser.displayName[0] : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedUser.displayName || 'Без имени'}
                  </Typography>
                  {selectedUser.username && (
                    <Typography variant="body2" color="textSecondary">
                      @{selectedUser.username}
                    </Typography>
                  )}
                  {selectedUser.telegramId && (
                    <Typography variant="body2" color="textSecondary">
                      Telegram ID: {selectedUser.telegramId}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Настройки прав администратора:
              </Typography>
              
              <FormControl component="fieldset" sx={{ mb: 2, display: 'block' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel id="admin-role-label">Тип администратора</InputLabel>
                      <Select
                        labelId="admin-role-label"
                        id="admin-role"
                        value={isSuperAdminRole ? 'superadmin' : 'admin'}
                        label="Тип администратора"
                        onChange={(e) => setIsSuperAdminRole(e.target.value === 'superadmin')}
                      >
                        <MenuItem value="admin">Администратор компании</MenuItem>
                        <MenuItem value="superadmin">Супер-администратор (полный доступ)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {!isSuperAdminRole && (
                    <Box>
                      <FormControl fullWidth required error={!selectedCompany}>
                        <InputLabel id="company-select-label">Компания</InputLabel>
                        <Select
                          labelId="company-select-label"
                          id="company-select"
                          value={selectedCompany}
                          label="Компания"
                          onChange={(e) => setSelectedCompany(e.target.value)}
                        >
                          {companies.map(company => (
                            <MenuItem key={company.id} value={company.id}>
                              {company.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {!selectedCompany && (
                          <FormHelperText>Выберите компанию для администратора</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleAssignAdmin} 
            variant="contained" 
            color="primary"
            disabled={!isSuperAdminRole && !selectedCompany}
          >
            Назначить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type || 'info'} 
          variant="filled"
          sx={{ width: '100%', display: notification ? 'flex' : 'none' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminsManager; 