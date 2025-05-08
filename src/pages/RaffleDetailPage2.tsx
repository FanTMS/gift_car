import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  Paper, 
  Chip, 
  Avatar,
  LinearProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  CircularProgress,
  Fab
} from '@mui/material';
import { 
  ArrowBack, 
  Share, 
  CalendarMonth, 
  CardGiftcard, 
  Person, 
  ExpandMore,
  DirectionsCar,
  Favorite,
  FavoriteBorder,
  ArrowDropDown,
  ArrowDropUp,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import ImageCarousel from '../components/ImageCarousel';
import Grid from '../components/utils/CustomGrid';

// Styled Components
const DetailCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(3),
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
  color: theme.palette.common.white,
  fontWeight: 700,
  padding: theme.spacing(1, 0.5),
  fontSize: '1.2rem',
  height: 'auto',
}));

const StatsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
  }
}));

const BuyButton = styled(Button)(({ theme }) => ({
  borderRadius: 100,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 700,
  background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.35)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
    transform: 'translateY(-2px)',
  }
}));

const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`car-details-tabpanel-${index}`}
      aria-labelledby={`car-details-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AdminFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
}));

const RaffleDetailPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    getRaffleById, 
    getRaffleParticipants, 
    getRaffleWinners,
    isAdmin,
    loading: globalLoading
  } = useFirebase();
  
  const [ticketCount, setTicketCount] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [adminMode, setAdminMode] = useState(false);
  
  const [raffleData, setRaffleData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadRaffleData = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('ID розыгрыша не указан');
          setLoading(false);
          return;
        }
        
        // Получение данных розыгрыша
        const raffle = await getRaffleById(id);
        if (!raffle) {
          setError('Розыгрыш не найден');
          setLoading(false);
          return;
        }
        
        setRaffleData(raffle);
        
        // Получение участников
        const participantsData = await getRaffleParticipants(id);
        setParticipants(participantsData || []);
        
        // Получение победителей
        const winnersData = await getRaffleWinners(id);
        setWinners(winnersData || []);
        
      } catch (err) {
        console.error('Ошибка при загрузке данных розыгрыша:', err);
        setError('Ошибка при загрузке данных розыгрыша');
      } finally {
        setLoading(false);
      }
    };
    
    loadRaffleData();
  }, [id, getRaffleById, getRaffleParticipants, getRaffleWinners]);
  
  const progress = raffleData ? (raffleData.ticketsSold / raffleData.totalTickets) * 100 : 0;
  const totalPrice = raffleData ? raffleData.price * ticketCount : 0;
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleIncrease = () => {
    setTicketCount(prev => prev + 1);
  };
  
  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };
  
  const handleBuyClick = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleFavoriteToggle = () => {
    setFavorite(!favorite);
  };
  
  if (loading || globalLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !raffleData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Ошибка при загрузке данных'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Вернуться назад
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: 2, paddingBottom: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Верхняя панель */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Назад
          </Button>
          
          <Box>
            <IconButton 
              aria-label="добавить в избранное" 
              sx={{ mr: 1 }}
              onClick={handleFavoriteToggle}
            >
              {favorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton aria-label="поделиться">
              <Share />
            </IconButton>
          </Box>
        </Box>
        
        {/* Отображение отладочной информации если она включена */}
        {raffleData.debugEnabled && raffleData.carSpecifications && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2">Debug data:</Typography>
            <pre style={{ overflow: 'auto', maxHeight: '150px' }}>
              {JSON.stringify(raffleData.carSpecifications, null, 2)}
            </pre>
          </Box>
        )}
        
        {/* Карусель изображений */}
        <ImageCarousel 
          images={raffleData.images} 
          height={280} 
          autoPlay={true}
          interval={5000}
        />
        
        {/* Основная информация о розыгрыше */}
        <DetailCard sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {raffleData.title}
            </Typography>
            <PriceChip label={`${raffleData.price} ₽`} />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.6 }}>
              {raffleData.description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatsItem>
                  <CalendarMonth fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Год
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {raffleData.year}
                    </Typography>
                  </Box>
                </StatsItem>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatsItem>
                  <DirectionsCar fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Мощность
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {raffleData.power}
                    </Typography>
                  </Box>
                </StatsItem>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatsItem>
                  <Person fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Участники
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {participants.length}
                    </Typography>
                  </Box>
                </StatsItem>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatsItem>
                  <CardGiftcard fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      До розыгрыша
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {raffleData.endDate && raffleData.endDate.seconds 
                        ? new Date(raffleData.endDate.seconds * 1000).toLocaleDateString('ru-RU')
                        : 'Дата не указана'}
                    </Typography>
                  </Box>
                </StatsItem>
              </Grid>
            </Grid>
            
            {/* Прогресс продажи билетов */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Продано билетов
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {raffleData.ticketsSold} из {raffleData.totalTickets}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }
                }}
              />
            </Box>
            
            {/* Выбор количества билетов и цена */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Количество билетов:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={handleDecrease} 
                  disabled={ticketCount <= 1}
                  sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', mr: 1 }}
                >
                  <ArrowDropDown />
                </IconButton>
                
                <TextField
                  variant="outlined"
                  value={ticketCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setTicketCount(value);
                    }
                  }}
                  sx={{ 
                    width: '70px',
                    '& .MuiOutlinedInput-input': { 
                      textAlign: 'center',
                      py: 1
                    }
                  }}
                />
                
                <IconButton 
                  onClick={handleIncrease}
                  sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', ml: 1 }}
                >
                  <ArrowDropUp />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Итого к оплате:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalPrice} ₽
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <BuyButton 
                variant="contained" 
                size="large" 
                fullWidth
                onClick={handleBuyClick}
              >
                Купить билет
              </BuyButton>
            </Box>
          </Box>
        </DetailCard>
        
        {/* Секция с табами для участников */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ borderRadius: theme.spacing(3), overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 56,
                }
              }}
            >
              <Tab label="Участники" />
            </Tabs>
            
            {/* Панель с участниками */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ minHeight: 200 }}>
                {participants.length > 0 ? (
                  <List>
                    {participants.map((participant, index) => (
                      <ListItem key={index} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                        <ListItemAvatar>
                          <Avatar src={participant.avatar || ''} alt={participant.name || `Участник ${index + 1}`}>
                            {!participant.avatar && (participant.name?.[0] || 'U')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={participant.name || `Участник ${index + 1}`}
                          secondary={`Билеты: ${participant.ticketCount || 1}`}
                        />
                        {participant.isWinner && (
                          <Chip 
                            label="Победитель" 
                            color="success" 
                            size="small" 
                            sx={{ borderRadius: 1 }}
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">
                      Пока никто не участвует в розыгрыше
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </motion.div>
      
      {/* Диалог покупки билета */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 'sm',
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Покупка билета
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы покупаете {ticketCount} {
              ticketCount === 1 ? 'билет' : 
              ticketCount < 5 ? 'билета' : 'билетов'
            } на розыгрыш автомобиля:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              component="img"
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 2,
                mr: 2,
              }}
              src={raffleData.images[0]}
              alt={raffleData.title}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {raffleData.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Розыгрыш состоится: {raffleData.endDate && raffleData.endDate.seconds 
                  ? new Date(raffleData.endDate.seconds * 1000).toLocaleDateString('ru-RU')
                  : 'Дата не указана'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Стоимость билета:
              </Typography>
              <Typography variant="body2">
                {raffleData.price} ₽
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Количество:
              </Typography>
              <Typography variant="body2">
                {ticketCount} шт
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight={600}>
                Итого:
              </Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {totalPrice} ₽
              </Typography>
            </Box>
          </Box>
          
          <TextField
            fullWidth
            label="Номер телефона"
            variant="outlined"
            placeholder="+7 (___) ___-__-__"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="E-mail"
            variant="outlined"
            placeholder="your@email.com"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ borderRadius: 3, px: 3 }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 3,
              px: 3,
              background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)'
            }}
          >
            Оплатить {totalPrice} ₽
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Кнопка администратора */}
      {isAdmin && (
        <AdminFab 
          color={adminMode ? "secondary" : "primary"} 
          aria-label="admin"
          onClick={() => setAdminMode(!adminMode)}
        >
          {adminMode ? <CloseIcon /> : <SettingsIcon />}
        </AdminFab>
      )}
    </Box>
  );
};

export default RaffleDetailPage; 