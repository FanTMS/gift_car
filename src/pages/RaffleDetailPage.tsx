import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack, 
  Share, 
  CalendarMonth, 
  CardGiftcard, 
  Person, 
  LocalOffer, 
  ExpandMore,
  LocalAtm,
  DirectionsCar,
  Favorite,
  FavoriteBorder,
  ArrowDropDown,
  ArrowDropUp,
  EmojiEvents
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';
import CarSpecificationsModal from '../components/CarSpecificationsModal';
import { getRaffle, getRaffleWinners } from '../firebase/services';
import { Raffle as RaffleType, CarSpecifications as CarSpecsType, Winner } from '../types';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { PaymentMethod } from '../types/payment';
import { PaymentProcessorService } from '../services/payment/PaymentProcessorService';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatTimeAgo, formatDate } from '../utils/formatters';
import PrizesList from '../components/PrizesList';
import WinnersList from '../components/WinnersList';
import CountdownTimer from '../components/CountdownTimer';

// Try/catch to handle potential missing components
let CarSpecifications: any;
let CarSpecificationsSimple: any;
let CarSpecificationsIcons: any;
let asFeatureCategory: any;

try {
  const CarSpecificationsModule = require('../components/CarSpecifications');
  CarSpecifications = CarSpecificationsModule.default;
  asFeatureCategory = CarSpecificationsModule.asFeatureCategory;
} catch (e) {
  // Create a simple fallback if component not found
  CarSpecifications = ({ features }: any) => (
    <Box>
      <Typography>Характеристики автомобиля временно недоступны</Typography>
    </Box>
  );
  asFeatureCategory = (category: string) => category;
}

try {
  CarSpecificationsSimple = require('../components/CarSpecificationsSimple').default;
} catch (e) {
  CarSpecificationsSimple = () => null;
}

try {
  CarSpecificationsIcons = require('../components/CarSpecificationsIcons').default;
} catch (e) {
  CarSpecificationsIcons = () => null;
}

// Define FeatureType if not available from CarSpecifications
interface FeatureType {
  name: string;
  category: string;
}

const ImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 280,
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: 200,
  },
}));

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

const ProgressLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(1),
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

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Определяем интерфейсы для участников
interface Participant {
  id: string;
  name: string;
  avatar: string;
  tickets: number;
  time: string;
}

// Определяем расширенный интерфейс для победителя с дополнительными полями
interface ExtendedWinner extends Winner {
  name?: string;
  avatar?: string;
  car?: string;
  date?: string;
  userData?: {
    displayName?: string;
    photoURL?: string;
  };
}

interface ExtendedRaffle extends Omit<RaffleType, 'status' | 'startDate' | 'endDate' | 'itemType'> {
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: any;
  endDate: any;
  recentParticipants: Participant[];
  winners: ExtendedWinner[];
  image?: string; // For backward compatibility
  itemType: 'cars' | 'phones' | 'consoles' | 'other';
}

// Default empty raffle data for loading state
const emptyRaffleData: Partial<ExtendedRaffle> = {
  id: '',
  title: '',
  images: [],
  description: '',
  ticketsSold: 0,
  totalTickets: 0,
  price: 0,
  year: 0,
  color: '',
  participants: 0,
  endDate: null,
  engine: '',
  power: '',
  acceleration: '',
  maxSpeed: '',
  features: [],
  carSpecifications: null,
  companyId: '',
  status: 'active',
  startDate: null,
  createdAt: null,
  recentParticipants: [],
  winners: [],
  itemType: 'other'
};

// Моковые данные для участников (используются, если нет реальных данных)
const mockRecentParticipants: Participant[] = [
  {
    id: '1',
    name: 'Алексей П.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    tickets: 2,
    time: '10 минут назад'
  },
  {
    id: '2',
    name: 'Мария С.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    tickets: 1,
    time: '2 часа назад'
  },
  {
    id: '3',
    name: 'Иван К.',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    tickets: 5,
    time: '3 часа назад'
  }
];

// Моковые данные для победителей (используются, если нет реальных данных)
const mockWinners: ExtendedWinner[] = [];

const PrizeCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

const PrizeImage = styled(CardMedia)(({ theme }) => ({
  height: 180,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
}));

const PlaceChip = styled(Chip)(({ theme, place }: { theme: any, place: number }) => {
  let color = theme.palette.primary.main;
  
  // Разные цвета для первых трех мест
  if (place === 1) color = '#FFD700'; // золото
  else if (place === 2) color = '#C0C0C0'; // серебро
  else if (place === 3) color = '#CD7F32'; // бронза
  
  return {
    position: 'absolute',
    top: 12,
    right: 12,
    fontWeight: 'bold',
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
  };
});

const WinnersTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const RaffleDetailPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { raffleId } = useParams();
  const location = useLocation();
  const [raffle, setRaffle] = useState<ExtendedRaffle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [openPaymentDialog, setOpenPaymentDialog] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [openSpecsModal, setOpenSpecsModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yoomoney');
  const [processing, setProcessing] = useState<boolean>(false);
  const [winners, setWinners] = useState<ExtendedWinner[]>([]);
  
  // Check if we're in buy mode from the URL
  const isBuyMode = location.pathname.includes('/buy');

  useEffect(() => {
    // If we're in buy mode, open the payment dialog when data is loaded
    if (isBuyMode && raffle && !loading) {
      setOpenPaymentDialog(true);
    }
  }, [isBuyMode, raffle, loading]);

  useEffect(() => {
    const fetchRaffleData = async () => {
      if (!raffleId) return;
      
      setLoading(true);
      try {
        const raffleData = await getRaffle(raffleId);
        
        if (!raffleData) {
          console.error('Розыгрыш не найден');
          navigate('/');
          return;
        }
        
        // Получаем данные о победителях
        if (raffleData.status === 'completed') {
          const winnersData: any[] = await getRaffleWinners(raffleId);
          // Преобразуем данные победителей для отображения в интерфейсе
          const extendedWinners: ExtendedWinner[] = winnersData.map(winner => ({
            ...winner,
            raffleId: raffleId,
            userId: winner.userId || '',
            ticketNumber: winner.ticketNumber || 0,
            winDate: winner.winDate || new Date(),
            userData: {
              displayName: `Участник ${winner.ticketNumber || '?'}`,
              photoURL: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 10) + 1}.jpg`
            }
          }));
          setWinners(extendedWinners);
        }

        // Convert old format to new format
        let images = raffleData.images;
        if (!images || images.length === 0) {
          if (raffleData.images) {
            images = [raffleData.images[0]];
          } else {
            images = ['/placeholder-car.jpg'];
          }
        }
        
        // Construct the extended raffle data
        setRaffle({
          ...raffleData,
          images,
          recentParticipants: mockRecentParticipants,
          winners: winners.length > 0 ? winners : mockWinners,
        });
      } catch (error) {
        console.error('Ошибка при загрузке данных о розыгрыше:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleData();
  }, [raffleId, navigate, winners]);
  
  const progress = raffle?.ticketsSold && raffle?.totalTickets 
    ? (raffle.ticketsSold / raffle.totalTickets) * 100 
    : 0;
    
  const totalPrice = (raffle?.price || 0) * ticketQuantity;
  
  const handleIncrease = () => {
    setTicketQuantity(prev => prev + 1);
  };
  
  const handleDecrease = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(prev => prev - 1);
    }
  };
  
  const handleBuyClick = () => {
    setOpenPaymentDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenPaymentDialog(false);
    
    // If we're in buy mode, redirect to the detail page without /buy
    if (isBuyMode) {
      navigate(`/raffles/${raffleId}`);
    }
  };
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleOpenSpecsModal = () => {
    setOpenSpecsModal(true);
  };
  
  const handleCloseSpecsModal = () => {
    setOpenSpecsModal(false);
  };
  
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const paymentDescription = `Билет на розыгрыш ${raffle?.title}`;
      const result = await PaymentProcessorService.processPayment(
        paymentMethod,
        totalPrice,
        paymentDescription,
        undefined, // customerId - можно передать id пользователя, если есть
        { 
          raffleId: raffleId,
          ticketCount: ticketQuantity
        }
      );
      
      if (!result.success) {
        console.error('Ошибка при обработке платежа:', result.error);
        // If we're in buy mode and there's an error, redirect to the detail page
        if (isBuyMode) {
          setOpenPaymentDialog(false);
          navigate(`/raffles/${raffleId}`);
        }
      }
      // Для успешных платежей перенаправление происходит в самом сервисе processPayment
      
    } catch (error) {
      console.error('Payment error:', error);
      // If we're in buy mode and there's an error, redirect to the detail page
      if (isBuyMode) {
        setOpenPaymentDialog(false);
        navigate(`/raffles/${raffleId}`);
      }
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!raffle) {
    return (
      <Typography variant="h5" align="center">Розыгрыш не найден</Typography>
    );
  }
  
  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton aria-label="поделиться">
              <Share />
            </IconButton>
          </Box>
        </Box>
        
        <ImageCarousel 
          images={raffle.images} 
          height={280} 
          autoPlay={true}
          interval={5000}
        />
        
        <DetailCard sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {raffle.title}
            </Typography>
            <PriceChip label={`${raffle.price.toLocaleString()} ₽`} />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.6 }}>
              {raffle.description}
            </Typography>
            
            {raffle.status === 'active' && raffle.endDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  До окончания розыгрыша:
                </Typography>
                <CountdownTimer 
                  endDate={new Date(raffle.endDate.seconds * 1000)} 
                  size="large" 
                />
              </Box>
            )}
            
            <StatsContainer>
              <StatsBox>
                <Typography variant="body2" color="text.secondary">Участников</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{raffle.participants || 0}</Typography>
              </StatsBox>
              <StatsBox>
                <Typography variant="body2" color="text.secondary">Продано билетов</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{raffle.ticketsSold}</Typography>
              </StatsBox>
              <StatsBox>
                <Typography variant="body2" color="text.secondary">Всего билетов</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{raffle.totalTickets}</Typography>
              </StatsBox>
            </StatsContainer>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Продано билетов
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {raffle.ticketsSold} из {raffle.totalTickets}
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
        
        {/* Отображение призовых мест для мульти-розыгрыша */}
        {raffle.isMultiPrize && raffle.prizePlaces && raffle.prizePlaces.length > 0 && (
          <PrizesList 
            prizePlaces={raffle.prizePlaces} 
            defaultImage={raffle.images[0]} 
          />
        )}
        
        {/* Отображение победителей для завершенных розыгрышей */}
        {raffle.status === 'completed' && (
          <WinnersList winners={winners} raffle={raffle} />
        )}
        
        <Box sx={{ mb: 3 }}>
          <CarSpecificationsIcons 
            engine={raffle.engine}
            power={raffle.power}
            acceleration={raffle.acceleration}
            maxSpeed={raffle.maxSpeed}
            color={raffle.color}
            year={raffle.year}
            carSpecifications={raffle.carSpecifications}
          />
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Характеристики автомобиля
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleOpenSpecsModal}
                endIcon={<ExpandMore />}
              >
                Подробнее
              </Button>
            </Box>
            
            <CarSpecifications 
              engine={raffle.engine}
              power={raffle.power}
              acceleration={raffle.acceleration}
              maxSpeed={raffle.maxSpeed}
              color={raffle.color}
              year={raffle.year}
              features={raffle.features}
              carSpecifications={raffle.carSpecifications}
            />
          </Box>
          
          <Accordion sx={{ borderRadius: 3, mb: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="participants-content"
              id="participants-header"
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Недавние участники
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {raffle.recentParticipants.map((participant) => (
                  <ListItem key={participant.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar alt={participant.name} src={participant.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {participant.name}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Купил(а) {participant.tickets} {
                              participant.tickets === 1 ? 'билет' : 
                              participant.tickets < 5 ? 'билета' : 'билетов'
                            }
                          </Typography>
                          {` — ${participant.time}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="winners-content"
              id="winners-header"
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Недавние победители
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {raffle.winners.map((winner) => (
                  <ListItem key={winner.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar alt={winner.name} src={winner.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {winner.name}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Выиграл(а) {winner.car}
                          </Typography>
                          {winner.winDate ? ` — ${new Date(winner.winDate.seconds * 1000).toLocaleDateString()}` : ''}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
      </motion.div>
      
      {/* Модальное окно с подробными характеристиками */}
      <CarSpecificationsModal 
        open={openSpecsModal}
        onClose={handleCloseSpecsModal}
        carSpecs={raffle.carSpecifications}
        features={raffle.features}
      />
      
      {/* Диалог покупки билета */}
      <Dialog
        open={openPaymentDialog}
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
            Вы покупаете {ticketQuantity} {
              ticketQuantity === 1 ? 'билет' : 
              ticketQuantity < 5 ? 'билета' : 'билетов'
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
              src={raffle.images.length > 0 ? raffle.images[0] : ''}
              alt={raffle.title || ''}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {raffle.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Розыгрыш состоится: {raffle.endDate && raffle.endDate.seconds 
                  ? new Date(raffle.endDate.seconds * 1000).toLocaleDateString('ru-RU')
                  : 'Дата не указана'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">
                Стоимость билета:
              </Typography>
              <Typography variant="body1">
                {raffle.price.toLocaleString()} ₽
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">
                Количество:
              </Typography>
              <Typography variant="body1">
                {ticketQuantity} шт.
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Итого к оплате:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {(raffle.price * ticketQuantity).toLocaleString()} ₽
              </Typography>
            </Box>
          </Box>
          
          <PaymentMethodSelector 
            selectedMethod={paymentMethod}
            onMethodChange={handlePaymentMethodChange}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            После оплаты вы получите уведомление с номером вашего билета. Розыгрыш будет проведен в прямом эфире {raffle.endDate && raffle.endDate.seconds 
            ? new Date(raffle.endDate.seconds * 1000).toLocaleDateString('ru-RU')
            : 'когда будет объявлено'}.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            disabled={processing}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handlePayment}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {processing ? 'Обработка...' : `Оплатить ${totalPrice.toLocaleString()} ₽`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RaffleDetailPage; 