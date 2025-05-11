import React, { useState } from 'react';
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
  useTheme,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  MoreVert, 
  Visibility, 
  CarRental, 
  People, 
  MonetizationOn,
  CardGiftcard,
  Settings,
  DirectionsCar,
  Business,
  Storage,
  SupervisorAccount,
  AccountBalanceWallet,
  Receipt,
  AddCircle,
  RemoveCircle,
  EmojiEvents
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Raffle } from '../types';
import CarSpecificationsForm from '../components/admin/CarSpecificationsForm';
import CompaniesManager from '../components/admin/CompaniesManager';
import DatabaseMigration from '../components/admin/DatabaseMigration';
import AppSettingsForm from '../components/admin/AppSettingsForm';
import CarSpecificationsModal from '../components/CarSpecificationsModal';
import AdminsManager from '../components/admin/AdminsManager';
import WalletsManager from '../components/admin/WalletsManager';
import TransactionsManager from '../components/admin/TransactionsManager';
import WinnersManager from '../components/admin/WinnersManager';
import { useUser } from '../context/UserContext';
import Grid from '../components/utils/CustomGrid';
import { RaffleDrawService } from '../services/raffle/RaffleDrawService';
import CountdownTimer from '../components/CountdownTimer';

const AdminHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
}));

const StatsIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const TablePaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(4),
}));

// Компонент для панели с разными вкладками
const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      style={{ padding: '16px 0' }}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const { raffles, companies, refreshData } = useFirebase();
  const { isSuperAdmin, isCompanyAdmin, adminCompanyId } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRaffle, setEditRaffle] = useState<Raffle | null>(null);
  const [openCarSpecsDialog, setOpenCarSpecsDialog] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [viewCarSpecsModal, setViewCarSpecsModal] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    image: '',
    description: '',
    totalTickets: '',
    price: '',
    status: 'draft',
    companyId: '',
    startDate: '',
    endDate: '',
    itemType: 'cars',
    images: [],
    isMultiPrize: false,
    prizePlaces: []
  });
  const [openWinnersDialog, setOpenWinnersDialog] = useState(false);
  const [selectedRaffleForWinners, setSelectedRaffleForWinners] = useState<string | null>(null);
  const [drawingRaffle, setDrawingRaffle] = useState<boolean>(false);
  const [drawingSuccess, setDrawingSuccess] = useState<string | null>(null);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  
  // Данные статистики
  const statsData = [
    { 
      title: 'Всего розыгрышей', 
      value: raffles.length, 
      icon: <CardGiftcard sx={{ fontSize: 30 }} />,
      change: `${raffles.filter(r => r.status === 'active').length} активных`
    },
    { 
      title: 'Активных участников', 
      value: raffles.reduce((sum, raffle) => sum + (raffle.participants || 0), 0), 
      icon: <People sx={{ fontSize: 30 }} />,
      change: 'Все розыгрыши'
    },
    { 
      title: 'Продано билетов', 
      value: raffles.reduce((sum, raffle) => sum + raffle.ticketsSold, 0), 
      icon: <MonetizationOn sx={{ fontSize: 30 }} />,
      change: 'Все розыгрыши'
    },
  ];
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Открыть диалог создания/редактирования
  const handleOpenDialog = (raffle?: any) => {
    if (raffle) {
      setEditRaffle(raffle);
      setForm({ ...raffle });
    } else {
      setEditRaffle(null);
      setForm({
        title: '', image: '', description: '', totalTickets: '', price: '', status: 'draft', endDate: '', companyId: '', startDate: '', itemType: 'cars', images: [], isMultiPrize: false, prizePlaces: []
      });
    }
    setOpenDialog(true);
  };
  
  // Закрыть диалог
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditRaffle(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name as string]: value });
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  const handleMultiPrizeToggle = () => {
    setForm({
      ...form,
      isMultiPrize: !form.isMultiPrize,
      prizePlaces: !form.isMultiPrize && form.prizePlaces.length === 0 ? [{ place: 1, description: 'Главный приз', prizeTitle: '' }] : form.prizePlaces
    });
  };
  
  const handleAddPrizePlace = () => {
    const newPlace = {
      place: form.prizePlaces.length + 1,
      description: `Приз ${form.prizePlaces.length + 1}`,
      prizeTitle: ''
    };
    setForm({
      ...form,
      prizePlaces: [...form.prizePlaces, newPlace]
    });
  };
  
  const handleRemovePrizePlace = (index: number) => {
    const updatedPrizePlaces = [...form.prizePlaces];
    updatedPrizePlaces.splice(index, 1);
    
    // Обновляем места после удаления
    const reindexedPrizePlaces = updatedPrizePlaces.map((prize, idx) => ({
      ...prize,
      place: idx + 1
    }));
    
    setForm({
      ...form,
      prizePlaces: reindexedPrizePlaces
    });
  };
  
  const handlePrizePlaceChange = (index: number, field: string, value: any) => {
    const updatedPrizePlaces = [...form.prizePlaces];
    updatedPrizePlaces[index] = {
      ...updatedPrizePlaces[index],
      [field]: value
    };
    
    setForm({
      ...form,
      prizePlaces: updatedPrizePlaces
    });
  };
  
  const handleSaveRaffle = async () => {
    try {
      // Prepare the raffle data
      const raffleData = {
        ...form,
        totalTickets: Number(form.totalTickets),
        price: Number(form.price),
        ticketsSold: editRaffle ? editRaffle.ticketsSold : 0,
        createdAt: editRaffle ? editRaffle.createdAt : new Date(),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        images: form.images
      };
      
      // Clean up the prizePlaces data
      if (raffleData.isMultiPrize && raffleData.prizePlaces) {
        // Ensure all prizePlaces have numeric place values and other required fields
        raffleData.prizePlaces = raffleData.prizePlaces.map((place: any) => ({
          ...place,
          place: Number(place.place),
          rangeStart: place.rangeStart ? Number(place.rangeStart) : undefined,
          rangeEnd: place.rangeEnd ? Number(place.rangeEnd) : undefined,
        }));
      } else {
        // If not a multi-prize raffle, remove the prizePlaces field
        delete raffleData.prizePlaces;
      }
      
      if (editRaffle) {
        // Update existing raffle
        const { id, ...updateData } = raffleData;
        await updateDoc(doc(db, 'raffles', editRaffle.id), updateData);
      } else {
        // Create new raffle
        await addDoc(collection(db, 'raffles'), raffleData);
      }
      
      // Reset form and close dialog
      setForm({
        title: '',
        description: '',
        totalTickets: '',
        price: '',
        status: 'draft',
        companyId: '',
        startDate: '',
        endDate: '',
        itemType: 'cars',
        images: [],
        isMultiPrize: false,
        prizePlaces: []
      });
      setOpenDialog(false);
      refreshData();
    } catch (error) {
      console.error('Ошибка при сохранении розыгрыша:', error);
    }
  };
  
  const handleDeleteRaffle = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот розыгрыш?')) {
      try {
        const raffleRef = doc(db, 'raffles', id);
        await deleteDoc(raffleRef);
        refreshData();
      } catch (error) {
        console.error("Error deleting raffle:", error);
      }
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'draft':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'draft':
        return 'Черновик';
      default:
        return 'Отменен';
    }
  };
  
  // Open car specifications dialog
  const handleOpenCarSpecs = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setOpenCarSpecsDialog(true);
  };
  
  // Close car specifications dialog
  const handleCloseCarSpecs = () => {
    setOpenCarSpecsDialog(false);
    setSelectedRaffle(null);
  };
  
  const handleViewCarSpecs = (raffle: Raffle) => {
    if (raffle.carSpecifications) {
      setSelectedRaffle(raffle);
      setViewCarSpecsModal(true);
    }
  };
  
  const handleCloseViewCarSpecs = () => {
    setViewCarSpecsModal(false);
  };
  
  const handleOpenWinnersManager = (raffleId: string) => {
    setSelectedRaffleForWinners(raffleId);
    setOpenWinnersDialog(true);
  };
  
  const handleCloseWinnersManager = () => {
    setOpenWinnersDialog(false);
    setSelectedRaffleForWinners(null);
  };
  
  // Проведение розыгрыша
  const handleDrawRaffle = async (raffleId: string, raffleName: string) => {
    if (window.confirm(`Вы уверены, что хотите провести розыгрыш "${raffleName}"? Эта операция не может быть отменена.`)) {
      setDrawingRaffle(true);
      setDrawingSuccess(null);
      setDrawingError(null);
      
      try {
        const winners = await RaffleDrawService.drawWinners(raffleId);
        setDrawingSuccess(`Розыгрыш успешно проведен. Выбрано ${winners.length} победителей.`);
        refreshData();
      } catch (error) {
        console.error('Ошибка при проведении розыгрыша:', error);
        setDrawingError((error as Error).message || 'Произошла ошибка при проведении розыгрыша');
      } finally {
        setDrawingRaffle(false);
      }
    }
  };
  
  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: { xs: 2, md: 3 } }}>
      <AdminHeader>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Панель администратора
          </Typography>
          <Typography variant="subtitle1">
            {isCompanyAdmin 
              ? `Управление компанией: ${companies.find(c => c.id === adminCompanyId)?.name || 'Без названия'}`
              : 'Управляйте розыгрышами, компаниями и настройками'}
          </Typography>
        </Box>
        <IconButton color="inherit">
          <Settings />
        </IconButton>
      </AdminHeader>
      
      {/* Табы для разных разделов */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="admin tabs"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 2,
            }
          }}
        >
          <Tab 
            icon={<CardGiftcard />} 
            iconPosition="start"
            label="Розыгрыши" 
            id="admin-tab-0" 
          />
          {!isCompanyAdmin && (
            <Tab 
              icon={<DirectionsCar />} 
              iconPosition="start"
              label="Автомобили" 
              id="admin-tab-1" 
            />
          )}
          {!isCompanyAdmin && (
            <Tab 
              icon={<Business />} 
              iconPosition="start"
              label="Компании" 
              id="admin-tab-2" 
            />
          )}
          {isSuperAdmin && (
            <Tab 
              icon={<AccountBalanceWallet />} 
              iconPosition="start"
              label="Кошельки" 
              id="admin-tab-3" 
            />
          )}
          {isSuperAdmin && (
            <Tab 
              icon={<Receipt />} 
              iconPosition="start"
              label="Транзакции" 
              id="admin-tab-4" 
            />
          )}
          {isSuperAdmin && (
            <Tab 
              icon={<SupervisorAccount />} 
              iconPosition="start"
              label="Администраторы" 
              id="admin-tab-5" 
            />
          )}
          {isSuperAdmin && (
            <Tab 
              icon={<Storage />} 
              iconPosition="start"
              label="База данных" 
              id="admin-tab-6" 
            />
          )}
          {isSuperAdmin && (
            <Tab 
              icon={<Settings />} 
              iconPosition="start"
              label="Настройки" 
              id="admin-tab-7" 
            />
          )}
        </Tabs>
      </Box>
      
      {/* Раздел статистики (только на вкладке Розыгрыши) */}
      <TabPanel value={tabValue} index={0}>
        {/* Фильтруем розыгрыши только для администратора компании */}
        {isCompanyAdmin && (
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Показаны розыгрыши только вашей компании. 
            У вас нет доступа к просмотру розыгрышей других компаний.
          </Typography>
        )}

        <Typography variant="h5" gutterBottom>
          Сводная статистика
        </Typography>
        
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatsCard>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <StatsIcon>
                      {stat.icon}
                    </StatsIcon>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.change}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        {drawingSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDrawingSuccess(null)}>
            {drawingSuccess}
          </Alert>
        )}
        
        {drawingError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDrawingError(null)}>
            {drawingError}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          <Typography variant="h5">
            Список розыгрышей
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Добавить розыгрыш
          </Button>
        </Box>
        
        <TablePaper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Компания</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Билеты</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Окончание</TableCell>
                  <TableCell>Прогресс</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Фильтруем розыгрыши по компании, если пользователь админ компании */}
                {raffles
                  .filter(raffle => !isCompanyAdmin || raffle.companyId === adminCompanyId)
                  .map((raffle) => {
                  const company = companies.find(c => c.id === raffle.companyId);
                  const progress = raffle.totalTickets ? (raffle.ticketsSold / raffle.totalTickets) * 100 : 0;
                  const endDate = raffle.endDate ? new Date(raffle.endDate.seconds * 1000) : null;
                  const isActive = raffle.status === 'active';
                  const canDraw = isActive && endDate && new Date() >= endDate;
                  
                  return (
                    <TableRow key={raffle.id}>
                      <TableCell>{raffle.title}</TableCell>
                      <TableCell>{company?.name || 'Неизвестно'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(raffle.status)} 
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(getStatusColor(raffle.status), 0.1),
                            color: getStatusColor(raffle.status),
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {raffle.ticketsSold}/{raffle.totalTickets}
                      </TableCell>
                      <TableCell>
                        {raffle.price.toLocaleString()} ₽
                      </TableCell>
                      <TableCell>
                        {endDate ? (
                          <Box sx={{ minWidth: 100 }}>
                            {isActive ? (
                              <CountdownTimer
                                endDate={endDate}
                                size="small"
                                showLabels={false}
                              />
                            ) : (
                              new Date(endDate).toLocaleDateString()
                            )}
                          </Box>
                        ) : 'Не указано'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(raffle)}
                          >
                            <Edit />
                          </IconButton>
                          
                          {raffle.itemType === 'cars' && (
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleOpenCarSpecs(raffle)}
                            >
                              <CarRental />
                            </IconButton>
                          )}
                          
                          {raffle.carSpecifications && (
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleViewCarSpecs(raffle)}
                            >
                              <Visibility />
                            </IconButton>
                          )}
                          
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenWinnersManager(raffle.id)}
                            color="primary"
                          >
                            <CardGiftcard />
                          </IconButton>
                          
                          {canDraw && (
                            <Tooltip title="Провести розыгрыш">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleDrawRaffle(raffle.id, raffle.title)}
                                disabled={drawingRaffle}
                              >
                                <EmojiEvents />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteRaffle(raffle.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TablePaper>
      </TabPanel>
      
      {/* Вкладка для управления автомобилями */}
      <TabPanel value={tabValue} index={1}>
        {!isCompanyAdmin && (
          <CarSpecificationsForm />
        )}
      </TabPanel>
      
      {/* Вкладка для управления компаниями */}
      <TabPanel value={tabValue} index={2}>
        {!isCompanyAdmin && (
          <CompaniesManager />
        )}
      </TabPanel>
      
      {/* Вкладка для управления кошельками */}
      <TabPanel value={tabValue} index={3}>
        {isSuperAdmin && (
          <WalletsManager />
        )}
      </TabPanel>
      
      {/* Вкладка для управления транзакциями */}
      <TabPanel value={tabValue} index={4}>
        {isSuperAdmin && (
          <TransactionsManager />
        )}
      </TabPanel>
      
      {/* Вкладка для управления администраторами */}
      <TabPanel value={tabValue} index={5}>
        {isSuperAdmin && (
          <AdminsManager isSuperAdmin={true} />
        )}
      </TabPanel>
      
      {/* Вкладка для управления базой данных */}
      <TabPanel value={tabValue} index={6}>
        {isSuperAdmin && (
          <DatabaseMigration />
        )}
      </TabPanel>
      
      {/* Вкладка для настроек приложения */}
      <TabPanel value={tabValue} index={7}>
        {isSuperAdmin && (
          <AppSettingsForm />
        )}
      </TabPanel>
      
      {/* Диалог создания/редактирования розыгрыша */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editRaffle ? 'Редактировать розыгрыш' : 'Создать новый розыгрыш'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Название розыгрыша"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              fullWidth
            />
            
            <TextField
              label="Описание"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              multiline
              rows={4}
              fullWidth
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Количество билетов"
                  name="totalTickets"
                  type="number"
                  value={form.totalTickets}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Цена билета"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Компания</InputLabel>
                  <Select
                    name="companyId"
                    value={form.companyId}
                    onChange={handleSelectChange}
                    label="Компания"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    onChange={handleSelectChange}
                    label="Статус"
                  >
                    <MenuItem value="draft">Черновик</MenuItem>
                    <MenuItem value="active">Активный</MenuItem>
                    <MenuItem value="completed">Завершен</MenuItem>
                    <MenuItem value="cancelled">Отменен</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дата начала"
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дата окончания"
                  name="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <FormControl fullWidth>
              <InputLabel>Тип приза</InputLabel>
              <Select
                name="itemType"
                value={form.itemType}
                onChange={handleSelectChange}
                label="Тип приза"
              >
                <MenuItem value="cars">Автомобили</MenuItem>
                <MenuItem value="phones">Телефоны</MenuItem>
                <MenuItem value="consoles">Консоли</MenuItem>
                <MenuItem value="other">Другое</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={form.isMultiPrize}
                  onChange={handleMultiPrizeToggle}
                  color="primary"
                />
              }
              label="Розыгрыш с несколькими призами"
            />
            
            {form.isMultiPrize && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Призовые места</Typography>
                  <Button 
                    startIcon={<AddCircle />} 
                    onClick={handleAddPrizePlace}
                    variant="outlined"
                  >
                    Добавить приз
                  </Button>
                </Box>
                
                <List>
                  {form.prizePlaces.map((prize: any, index: number) => (
                    <Paper key={index} elevation={1} sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Место"
                            type="number"
                            value={prize.place}
                            onChange={(e) => handlePrizePlaceChange(index, 'place', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={5}>
                          <TextField
                            label="Описание приза"
                            value={prize.description}
                            onChange={(e) => handlePrizePlaceChange(index, 'description', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={5}>
                          <TextField
                            label="Название приза"
                            value={prize.prizeTitle}
                            onChange={(e) => handlePrizePlaceChange(index, 'prizeTitle', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Диапазон билетов (от)"
                            type="number"
                            value={prize.rangeStart || ''}
                            onChange={(e) => handlePrizePlaceChange(index, 'rangeStart', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Диапазон билетов (до)"
                            type="number"
                            value={prize.rangeEnd || ''}
                            onChange={(e) => handlePrizePlaceChange(index, 'rangeEnd', e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Button
                            startIcon={<RemoveCircle />}
                            color="error"
                            onClick={() => handleRemovePrizePlace(index)}
                          >
                            Удалить приз
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveRaffle} variant="contained" color="primary">
            {editRaffle ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог для создания/редактирования спецификаций автомобиля */}
      <Dialog open={openCarSpecsDialog} onClose={handleCloseCarSpecs} maxWidth="lg" fullWidth>
        <DialogTitle>
          Спецификации автомобиля - {selectedRaffle?.title}
        </DialogTitle>
        <DialogContent>
          {selectedRaffle && (
            <CarSpecificationsForm raffleId={selectedRaffle.id} onSaved={handleCloseCarSpecs} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCarSpecs} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно для просмотра спецификаций автомобиля */}
      <Dialog open={viewCarSpecsModal} onClose={handleCloseViewCarSpecs} maxWidth="md" fullWidth>
        <DialogTitle>
          Характеристики автомобиля - {selectedRaffle?.title}
        </DialogTitle>
        <DialogContent>
          {selectedRaffle?.carSpecifications && (
            <CarSpecificationsModal 
              carSpecs={selectedRaffle.carSpecifications} 
              inDialog={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewCarSpecs} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог управления победителями */}
      <Dialog
        open={openWinnersDialog}
        onClose={handleCloseWinnersManager}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Управление победителями розыгрыша</DialogTitle>
        <DialogContent dividers>
          {selectedRaffleForWinners && <WinnersManager raffleId={selectedRaffleForWinners} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWinnersManager}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage; 