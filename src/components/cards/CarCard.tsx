import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  LinearProgress, 
  Chip, 
  useTheme, 
  Tooltip, 
  Badge, 
  IconButton,
  Avatar,
  Divider,
  Paper,
  Skeleton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  CalendarMonth, 
  Person, 
  Speed, 
  ArrowForward, 
  LocalOffer, 
  Favorite, 
  FavoriteBorder,
  CheckCircle,
  HourglassEmpty,
  NewReleases,
  Close,
  Smartphone,
  SportsEsports,
  CardGiftcard,
  PeopleAlt,
  Sell,
  Verified,
  DirectionsCar
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { format, isAfter, addDays, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useFirebase } from '../../context/FirebaseContext';

// Обновленные стили для карточки с современным дизайном
const MotionCard = styled(motion.div)(({ theme }) => ({
  borderRadius: 32,
  overflow: 'visible',
  width: '100%',
  marginBottom: 28,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  height: '100%',
  position: 'relative',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 32,
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'light' 
    ? '0 15px 35px rgba(0,0,0,0.07), 0 5px 15px rgba(0,0,0,0.03)'
    : '0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
  transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  '&:hover': {
    boxShadow: theme.palette.mode === 'light' 
      ? '0 25px 45px rgba(0,0,0,0.09), 0 10px 20px rgba(0,0,0,0.05)'
      : '0 25px 45px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.15)',
    transform: 'translateY(-10px) scale(1.01)',
  }
}));

const CardDetailsContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3.5, 4, 3, 4),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5, 3, 2, 3),
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(3),
  gap: theme.spacing(0.75),
  '& svg': {
    fontSize: 18,
    color: theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.main, 0.85)
      : alpha(theme.palette.primary.light, 0.85),
  }
}));

const BuyButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.3, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 25px rgba(0, 82, 204, 0.2)'
    : '0 8px 25px rgba(76, 154, 255, 0.25)',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)'
    : 'linear-gradient(135deg, #4C9AFF 0%, #2684FF 100%)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'light'
      ? '0 12px 30px rgba(0, 82, 204, 0.3)'
      : '0 12px 30px rgba(76, 154, 255, 0.35)',
    transform: 'translateY(-4px) scale(1.02)',
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #0747A6 0%, #0052CC 100%)'
      : 'linear-gradient(135deg, #2684FF 0%, #4C9AFF 100%)',
  }
}));

const ProgressLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2.5),
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)'
    : 'linear-gradient(135deg, #4C9AFF 0%, #2684FF 100%)',
  color: 'white',
  position: 'absolute',
  top: 16,
  right: 70,
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 20px rgba(0, 82, 204, 0.2)'
    : '0 8px 20px rgba(76, 154, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  zIndex: 2,
  padding: '0.5rem 1.2rem',
  height: 'auto',
  fontSize: '1rem',
  '& .MuiChip-label': {
    padding: 0
  }
}));

const StatusBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color?: string }>(({ theme, color }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  backgroundColor: alpha(color || theme.palette.error.main, 0.92),
  color: 'white',
  padding: theme.spacing(0.6, 1.6),
  borderRadius: 16,
  fontWeight: 600,
  fontSize: '0.8rem',
  zIndex: 2,
  boxShadow: `0 8px 20px ${alpha(color || theme.palette.error.main, 0.35)}`,
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5)
  }
}));

const CardMediaWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 240,
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.background.paper, 0.05),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.9)}, transparent)`,
    zIndex: 1,
    opacity: 0.7,
  },
  [theme.breakpoints.down('sm')]: {
    height: 200,
  }
}));

const StyledCardMedia = styled('img')(({ theme }) => ({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const DetailsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2.2),
  borderRadius: 14,
  borderColor: alpha(theme.palette.primary.main, 0.5),
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.06),
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
  }
}));

const CompanyLogo = styled(Avatar)(({ theme }) => ({
  position: 'absolute',
  bottom: -24,
  left: 24,
  width: 48,
  height: 48,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.palette.mode === 'light'
    ? '0 6px 16px rgba(0,0,0,0.12)'
    : '0 6px 16px rgba(0,0,0,0.28)',
  zIndex: 3,
}));

const FavoriteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    transform: 'scale(1.1) translateY(-2px)',
  },
  zIndex: 2,
  width: 42,
  height: 42,
  boxShadow: theme.palette.mode === 'light'
    ? '0 6px 16px rgba(0,0,0,0.08)'
    : '0 6px 16px rgba(0,0,0,0.22)',
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(10px)',
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: theme.palette.mode === 'light'
    ? '0 6px 16px rgba(0,0,0,0.08)'
    : '0 6px 16px rgba(0,0,0,0.22)',
  zIndex: 2
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  height: 30,
  fontSize: '0.8rem',
  fontWeight: 600,
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& .MuiChip-label': {
    padding: '0 10px',
  }
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.4rem',
  lineHeight: 1.3,
  marginBottom: theme.spacing(0.75),
  color: theme.palette.text.primary,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  }
}));

const SubTitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: theme.spacing(1.5),
  }
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.5),
  }
}));

const BottomActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
  }
}));

interface Company {
  id: string;
  name: string;
  logo?: string;
  color?: string;
}

interface CarCardProps {
  id: string;
  title: string;
  image?: string | null;
  description: string;
  ticketsSold: number;
  totalTickets: number;
  price: number;
  year: number;
  participants: number;
  endDate: string;
  status?: 'active' | 'completed' | 'canceled' | 'draft';
  companyId?: string;
  createdAt?: any;
  isFavorite?: boolean;
  toggleFavorite?: (id: string) => Promise<void>;
  itemType?: 'cars' | 'phones' | 'consoles' | 'other';
}

// Форматирование даты с проверкой валидности
const formatEndDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Проверка валидности даты
    if (!isValid(date)) {
      return 'Дата не указана';
    }
    return format(date, 'dd MMMM yyyy', { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Дата не указана';
  }
};

const CarCard: React.FC<CarCardProps> = ({
  id,
  title,
  image,
  description,
  ticketsSold,
  totalTickets,
  price,
  year,
  participants,
  endDate,
  status = 'active',
  companyId,
  createdAt,
  isFavorite = false,
  toggleFavorite,
  itemType = 'cars'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { companies } = useFirebase();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const progress = (ticketsSold / totalTickets) * 100;
  
  // Находим компанию по id и применяем приведение типа
  const company = companyId ? companies?.find(c => c.id === companyId) as Company | null : null;
  
  // Форматирование даты
  const formattedEndDate = formatEndDate(endDate);
  
  // Проверка истекшего розыгрыша
  const isExpired = () => {
    try {
      const date = new Date(endDate);
      if (!isValid(date)) {
        return false;
      }
      return isAfter(new Date(), date);
    } catch (error) {
      console.error('Error checking expired date:', error);
      return false;
    }
  };

  // Расчет оставшихся билетов
  const ticketsLeft = totalTickets - ticketsSold;

  // Получение цвета прогресса
  const getProgressColor = () => {
    if (progress > 85) return theme.palette.success.main;
    if (progress > 50) return theme.palette.primary.main;
    return theme.palette.warning.main;
  };

  // Получение информации о статусе
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Завершен',
          color: theme.palette.success.main,
          icon: <CheckCircle />
        };
      case 'canceled':
        return {
          label: 'Отменен',
          color: theme.palette.error.main,
          icon: <Close />
        };
      case 'draft':
        return {
          label: 'Черновик',
          color: theme.palette.grey[500],
          icon: <HourglassEmpty />
        };
      case 'active':
      default:
        if (isExpired()) {
          return {
            label: 'Завершен',
            color: theme.palette.success.main,
            icon: <CheckCircle />
          };
        }
        if (createdAt && typeof createdAt.toDate === 'function') {
          try {
            const createdDate = createdAt.toDate();
            if (isAfter(addDays(createdDate, 5), new Date())) {
              return {
                label: 'Новый',
                color: theme.palette.info.main,
                icon: <NewReleases />
              };
            }
          } catch (error) {
            console.error('Error processing createdAt date:', error);
          }
        }
        return null;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(id);
    }
  };

  // Получение иконки типа товара
  const getItemTypeIcon = () => {
    switch (itemType) {
      case 'phones':
        return <Smartphone />;
      case 'consoles':
        return <SportsEsports />;
      case 'other':
        return <CardGiftcard />;
      case 'cars':
      default:
        return <DirectionsCar />;
    }
  };

  // Получение тени в зависимости от elevation
  const getElevation = () => {
    if (progress > 85) {
      return theme.palette.mode === 'light' 
        ? '0 15px 30px rgba(38, 132, 255, 0.15), 0 6px 15px rgba(0, 71, 166, 0.1)'
        : '0 15px 30px rgba(76, 154, 255, 0.2), 0 6px 15px rgba(38, 132, 255, 0.15)';
    }
    
    return 'none';
  };

  // Получение запасного изображения
  const getFallbackImage = () => {
    switch (itemType) {
      case 'phones':
        return '/images/placeholder-phone.jpg';
      case 'consoles':
        return '/images/placeholder-console.jpg';
      case 'other':
        return '/images/placeholder-gift.jpg';
      case 'cars':
      default:
        return 'https://i.postimg.cc/28QPpVX4/1.png';
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const statusInfo = getStatusInfo();

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
  
  // Анимационные варианты для карточки
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.2, 0.8, 0.2, 1] 
      }
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/raffles/${id}`);
  };
  
  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/raffles/${id}/buy`);
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        // Удаляем дополнительные эффекты при наведении, оставляя только базовую анимацию
        // scale: 1.02,
        // y: -5
      }}
    >
      <StyledCard 
        elevation={0} 
        sx={{ boxShadow: getElevation() }}
      >
        {statusInfo && (
          <StatusBadge color={statusInfo.color}>
            {statusInfo.icon}
            {statusInfo.label}
          </StatusBadge>
        )}
        
        <PriceChip 
          size="medium" 
          label={formattedPrice} 
        />
        
        <FavoriteButton 
          aria-label="Добавить в избранное" 
          onClick={handleFavoriteClick}
          size="small"
        >
          {isFavorite ? (
            <Favorite 
              sx={{ 
                color: theme.palette.error.main,
                fontSize: '1.3rem'
              }} 
            />
          ) : (
            <FavoriteBorder 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '1.3rem'
              }} 
            />
          )}
        </FavoriteButton>
        
        <CardMediaWrapper>
          {company && (
            <CompanyLogo 
              src={company.logo || ''} 
              alt={company.name}
            >
              {!company.logo && company.name.substring(0, 1)}
            </CompanyLogo>
          )}
          
          {!isImageLoaded && (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%"
              animation="wave" 
              sx={{
                borderRadius: 0,
                '&::after': {
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.background.paper, 0)}, 
                    ${alpha(theme.palette.background.paper, 0.3)}, 
                    ${alpha(theme.palette.background.paper, 0)}
                  )`
                }
              }}
            />
          )}
          
          <StyledCardMedia
            onLoad={handleImageLoad}
            style={{ display: isImageLoaded ? 'block' : 'none' }}
            src={image || getFallbackImage()}
            alt={title}
          />
          
          <IconContainer>
            {getItemTypeIcon()}
          </IconContainer>
        </CardMediaWrapper>
        
        <CardDetailsContainer>
          <TitleTypography variant="h5">
            {title}
          </TitleTypography>
          
          <SubTitleTypography variant="body2" color="textSecondary">
            {description}
          </SubTitleTypography>
          
          <StatsContainer>
            <InfoRow>
              <CalendarMonth fontSize="small" />
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                {year}
              </Typography>
            </InfoRow>
            
            <InfoRow>
              <PeopleAlt fontSize="small" />
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                {participants}
              </Typography>
            </InfoRow>
            
            <InfoRow>
              <Verified fontSize="small" />
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                Гарантия
              </Typography>
            </InfoRow>
          </StatsContainer>
          
          <Box sx={{ width: '100%', mb: 2.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: alpha(theme.palette.divider, 0.15),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundImage: `linear-gradient(135deg, ${alpha(getProgressColor(), 0.8)} 0%, ${getProgressColor()} 100%)`,
                }
              }} 
            />
            
            <ProgressLabel>
              <Typography variant="caption" color="textSecondary" fontWeight={500} fontSize="0.8rem">
                Билетов продано: <b>{ticketsSold} из {totalTickets}</b>
              </Typography>
              <Typography variant="caption" color="textSecondary" fontWeight={600} fontSize="0.8rem">
                <b>{Math.round(progress)}%</b>
              </Typography>
            </ProgressLabel>
          </Box>
          
          <BottomActions>
            <DetailsButton
              variant="outlined"
              size="small"
              endIcon={<ArrowForward fontSize="small" />}
              onClick={handleDetailsClick}
            >
              Подробнее
            </DetailsButton>
            
            <BuyButton
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<LocalOffer fontSize="small" />}
              disableElevation
              onClick={handleBuyClick}
              sx={{ marginLeft: theme.spacing(2), flexGrow: 1 }}
            >
              Купить билет
            </BuyButton>
          </BottomActions>
        </CardDetailsContainer>
      </StyledCard>
    </MotionCard>
  );
};

export default CarCard; 