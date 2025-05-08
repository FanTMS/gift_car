import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  InputBase, 
  IconButton, 
  Chip, 
  Grid, 
  Button, 
  Stack, 
  Select, 
  MenuItem, 
  FormControl, 
  Divider, 
  useMediaQuery,
  SwipeableDrawer,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  DirectionsCar, 
  LocalOffer, 
  Close, 
  Tune,
  TrendingUp,
  AccessTime,
  NewReleases,
  Smartphone,
  SportsEsports,
  CardGiftcard,
  Favorite,
  AccountBalanceWallet,
  AddCircleOutline,
  Payment,
  ChevronRight
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CarCard from '../components/cards/CarCard';
import CompanySelector from '../components/company/CompanySelector';
import { useFirebase } from '../context/FirebaseContext';
import WalletWidget from '../components/wallet/WalletWidget';
import { getUserFavorites, toggleFavoriteRaffle } from '../firebase/services';

// Стилизованные компоненты
const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.background.paper, 1),
  boxShadow: theme.palette.mode === 'light' 
    ? '0 4px 20px rgba(0,0,0,0.05)' 
    : '0 4px 20px rgba(0,0,0,0.2)',
  width: '100%',
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'light' 
      ? '0 6px 24px rgba(0,0,0,0.08)' 
      : '0 6px 24px rgba(0,0,0,0.25)',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.text.secondary, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.8, 1.5, 1.8, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0, 0.5, 1, 0),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontWeight: 500,
  borderRadius: 12,
  '&.MuiChip-clickable:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.8),
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0, 0.8, 1, 0),
  fontWeight: 500,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  '&.MuiChip-clickable:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  }
}));

const HeroContainer = styled(Box)(({ theme }) => ({
  borderRadius: 24,
  overflow: 'hidden',
  position: 'relative',
  height: 340,
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
  color: 'white',
  boxShadow: '0 12px 30px rgba(25, 118, 210, 0.25)',
  [theme.breakpoints.down('md')]: {
    height: 300,
  },
  [theme.breakpoints.down('sm')]: {
    height: 'auto',
    paddingBottom: theme.spacing(4),
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  zIndex: 3,
  padding: theme.spacing(5, 4, 4, 4),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  maxWidth: '55%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    maxWidth: '100%'
  },
}));

const HeroBackgroundEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '100%',
  height: '100%',
  background: 'radial-gradient(60% 80% at 70% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
  zIndex: 0,
}));

const HeroBackgroundCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10%',
  right: '5%',
  width: 280,
  height: 280,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    width: 200,
    height: 200,
  },
}));

const HeroBackgroundCircleSmall = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '10%',
  left: '10%',
  width: 140,
  height: 140,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.05)',
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    width: 100,
    height: 100,
  },
}));

const HeroImage = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '45%',
  height: '95%',
  backgroundImage: `url('https://i.postimg.cc/28QPpVX4/1.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '80px 0 0 0',
  zIndex: 2,
  boxShadow: '-10px 10px 30px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    borderRadius: '80px 0 0 0',
  },
  [theme.breakpoints.down('md')]: {
    width: '45%',
    borderRadius: '60px 0 0 0',
    '&::before': {
      borderRadius: '60px 0 0 0',
    }
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
}));

const FilterDrawerContent = styled(Box)(({ theme }) => ({
  width: 320,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
  },
}));

const BalanceCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(2.5),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  position: 'relative',
}));

const BalanceAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  marginBottom: theme.spacing(0.5),
}));

const BalanceActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
}));

const QuickAction = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  padding: theme.spacing(0.5, 2),
  fontWeight: 600,
  textTransform: 'none',
}));

const BalanceActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(6),
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
}));

const WalletCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-30px',
  right: '-30px',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: alpha(theme.palette.primary.main, 0.05),
  zIndex: 0,
}));

// Фильтры категорий
const categories = [
  {
    id: 'all',
    label: 'Все',
    icon: <LocalOffer />,
    color: '#1976D2'
  },
  {
    id: 'favorites',
    label: 'Избранное',
    icon: <Favorite />,
    color: '#F44336'
  }
];

// Фильтры цен
const priceFilters = [
  { id: 'all', label: 'Любая цена' },
  { id: 'under500', label: 'До 500 ₽' },
  { id: '500to1000', label: '500 — 1000 ₽' },
  { id: 'over1000', label: 'Более 1000 ₽' },
];

// Фильтры марки
const brandFilters = [
  { id: 'all', label: 'Все марки' },
  { id: 'bmw', label: 'BMW' },
  { id: 'mercedes', label: 'Mercedes' },
  { id: 'audi', label: 'Audi' },
  { id: 'tesla', label: 'Tesla' },
];

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(5000); // Установим начальное значение баланса
  
  // Используем контекст Firebase
  const { 
    user, 
    raffles, 
    loading, 
    error, 
    activeCompany, 
    setActiveCompany 
  } = useFirebase();
  
  // Загрузка избранных розыгрышей при монтировании компонента
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          // Получаем избранные розыгрыши из Firebase
          const userFavorites = await getUserFavorites(user.uid);
          setFavorites(userFavorites);
        } catch (err) {
          console.error("Ошибка при загрузке избранных розыгрышей:", err);
        }
      } else {
        // Используем локальное хранилище для неавторизованных пользователей
        const userFavorites = localStorage.getItem('userFavorites');
        if (userFavorites) {
          setFavorites(JSON.parse(userFavorites));
        }
      }
      
      // В реальном приложении здесь также получим баланс пользователя
      // в данном примере используем моковое значение
    };
    
    loadFavorites();
  }, [user]);
  
  // Функция для добавления/удаления из избранного
  const toggleFavorite = async (raffleId: string) => {
    try {
      const newIsFavorite = !favorites.includes(raffleId);
      
      if (user) {
        // Обновляем в Firebase для авторизованных пользователей
        await toggleFavoriteRaffle(raffleId, user.uid, newIsFavorite);
        
        // Обновляем локальное состояние
        const newFavorites = newIsFavorite 
          ? [...favorites, raffleId]
          : favorites.filter(id => id !== raffleId);
        
        setFavorites(newFavorites);
      } else {
        // Для неавторизованных пользователей используем локальное хранилище
        const newFavorites = newIsFavorite
          ? [...favorites, raffleId]
          : favorites.filter(id => id !== raffleId);
        
        setFavorites(newFavorites);
        localStorage.setItem('userFavorites', JSON.stringify(newFavorites));
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного:", err);
    }
  };
  
  // Проверка, находится ли розыгрыш в избранном
  const isFavorite = (raffleId: string) => favorites.includes(raffleId);

  // Обработчики фильтрации
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Открыть/закрыть drawer с фильтрами
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };
  
  // Применить фильтры
  const applyFilters = () => {
    setDrawerOpen(false);
  };
  
  // Сбросить фильтры
  const resetFilters = () => {
    setSelectedPrice('all');
    setSelectedBrand('all');
  };
  
  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  // Функция для фильтрации розыгрышей
  const filteredRaffles = () => {
    if (!raffles) return [];
    
    return raffles.filter(raffle => {
      // Фильтрация по поиску
      if (searchQuery && !raffle.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Фильтрация по категории
      if (selectedCategory !== 'all') {
        // Для избранного проверяем по массиву favorites
        if (selectedCategory === 'favorites' && !favorites.includes(raffle.id)) {
          return false;
        }
        
        // Для остальных категорий проверяем по типу розыгрыша
        if (selectedCategory !== 'favorites' && raffle.itemType !== selectedCategory) {
          return false;
        }
      }
      
      // Фильтрация по цене билета
      if (selectedPrice !== 'all') {
        if (selectedPrice === 'under500' && raffle.price >= 500) {
          return false;
        }
        if (selectedPrice === '500to1000' && (raffle.price < 500 || raffle.price > 1000)) {
          return false;
        }
        if (selectedPrice === 'over1000' && raffle.price <= 1000) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Перезаписываем переменную carData для использования данных Firebase
  const carData = filteredRaffles();
  
  const navigate = useNavigate();
  
  return (
    <Container disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeroContainer>
          <HeroBackgroundEffect />
          <HeroBackgroundCircle />
          <HeroBackgroundCircleSmall />
          <HeroContent>
            <Box sx={{ zIndex: 2, width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 800, 
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
                }}>
                  Выиграй автомобиль своей мечты
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Typography variant="body1" sx={{ 
                  mb: 3.5, 
                  opacity: 0.95,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  maxWidth: '90%'
                }}>
                  Участвуй в розыгрышах роскошных автомобилей всего от 500 ₽. Более 250 победителей уже получили свои авто!
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DirectionsCar />}
                  sx={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    borderRadius: 3,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 600,
                    padding: theme.spacing(1.2, 3),
                    border: '2px solid white',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.15),
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Участвовать сейчас
                </Button>
              </motion.div>
            </Box>
          </HeroContent>
          <HeroImage />
        </HeroContainer>

        {/* Добавляем виджет кошелька */}
        <WalletWidget balance={balance} />

        {/* НОВЫЙ РАЗДЕЛ: Селектор компаний */}
        <CompanySelector />
        
        {/* Строка поиска и фильтров */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <SearchContainer sx={{ flex: 1 }}>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Поиск автомобилей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              boxShadow: theme.palette.mode === 'light' 
                ? '0 4px 20px rgba(0,0,0,0.05)' 
                : '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <IconButton 
              aria-label="filter" 
              onClick={() => toggleDrawer(true)}
              sx={{ 
                height: '100%',
                width: 50,
                borderRadius: 0,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Tune />
            </IconButton>
          </Paper>
        </Box>
        
        {/* Заголовок раздела */}
        <SectionTitle variant="h5">
          <LocalOffer fontSize="small" /> 
          {activeCompany && activeCompany.name
            ? `Розыгрыши от ${activeCompany.name}` 
            : 'Актуальные розыгрыши'}
        </SectionTitle>
        
        {/* Категории (прокручиваемая строка) */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              overflowX: 'auto', 
              py: 1,
              px: 0.5,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none'
            }}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                icon={category.icon}
                label={category.label}
                clickable
                onClick={() => handleCategoryChange(category.id)}
                sx={{
                  backgroundColor: selectedCategory === category.id 
                    ? alpha(category.color, 0.15) 
                    : theme.palette.background.paper,
                  color: selectedCategory === category.id 
                    ? category.color
                    : theme.palette.text.primary,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: selectedCategory === category.id 
                    ? alpha(category.color, 0.5)
                    : 'transparent',
                  fontWeight: selectedCategory === category.id ? 600 : 500,
                  '& .MuiChip-icon': {
                    color: selectedCategory === category.id ? category.color : 'inherit'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
        
        {/* Список автомобилей */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : carData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography>Нет доступных розыгрышей для текущих фильтров</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {carData.map((car) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={car.id}>
                  <motion.div variants={itemVariants}>
                    <CarCard
                      id={car.id}
                      title={car.title}
                      image={car.images && car.images.length > 0 ? car.images[0] : null}
                      description={car.description}
                      ticketsSold={car.ticketsSold}
                      totalTickets={car.totalTickets}
                      price={car.price}
                      year={car.year || 0}
                      participants={car.participants || 0}
                      endDate={car.endDate && car.endDate.seconds ? 
                        new Date(car.endDate.seconds * 1000).toISOString() : 
                        String(car.endDate)}
                      status="active"
                      isFavorite={isFavorite(car.id)}
                      toggleFavorite={toggleFavorite}
                      itemType={car.itemType}
                      companyId={car.companyId}
                      createdAt={car.createdAt}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
          
          {carData.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  textTransform: 'none', 
                  px: 4,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.25)',
                    transform: 'translateY(-2px)',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Показать больше розыгрышей
              </Button>
            </Box>
          )}
        </motion.div>
        
        {/* Выдвижной фильтр */}
        <SwipeableDrawer
          anchor={isMobile ? 'bottom' : 'right'}
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
          onOpen={() => toggleDrawer(true)}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? '24px 24px 0 0' : 0
            }
          }}
        >
          <FilterDrawerContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Фильтры
              </Typography>
              <IconButton onClick={() => toggleDrawer(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Цена билета
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
              {priceFilters.map(filter => (
                <FilterChip 
                  key={filter.id}
                  label={filter.label} 
                  clickable 
                  onClick={() => setSelectedPrice(filter.id)}
                  className={selectedPrice === filter.id ? 'Mui-selected' : ''}
                />
              ))}
            </Stack>
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Марка автомобиля
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
              {brandFilters.map(filter => (
                <FilterChip 
                  key={filter.id}
                  label={filter.label} 
                  clickable 
                  onClick={() => setSelectedBrand(filter.id)}
                  className={selectedBrand === filter.id ? 'Mui-selected' : ''}
                />
              ))}
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="text" 
                onClick={resetFilters}
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500
                }}
              >
                Сбросить все
              </Button>
              <Button 
                variant="contained" 
                onClick={applyFilters}
                sx={{ 
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                  borderRadius: 3,
                  px: 3
                }}
              >
                Применить
              </Button>
            </Box>
          </FilterDrawerContent>
        </SwipeableDrawer>
      </motion.div>
    </Container>
  );
};

export default HomePage; 