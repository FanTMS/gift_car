import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  IconButton,
  useTheme,
  styled
} from '@mui/material';
import {
  DirectionsCar,
  Speed,
  Timer,
  LocalGasStation,
  Palette,
  Settings,
  EventSeat,
  Close,
  SquareFoot,
  Animation,
  WorkspacePremium
} from '@mui/icons-material';

// Определение интерфейса FeatureType
interface FeatureType {
  id: string;
  name: string;
  category: 'exterior' | 'interior' | 'comfort' | 'safety' | 'tech' | 'performance' | 'technology';
}

const SpecItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
  }
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '&.exterior': { backgroundColor: '#e3f2fd', color: '#1976d2' },
  '&.interior': { backgroundColor: '#f3e5f5', color: '#9c27b0' },
  '&.comfort': { backgroundColor: '#e8f5e9', color: '#388e3c' },
  '&.safety': { backgroundColor: '#fff3e0', color: '#f57c00' },
  '&.tech': { backgroundColor: '#e1f5fe', color: '#0288d1' },
  '&.performance': { backgroundColor: '#fce4ec', color: '#d81b60' },
  '&.technology': { backgroundColor: '#e8eaf6', color: '#3f51b5' }
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
}));

const RowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(-1.5),
  marginRight: theme.spacing(-1.5),
}));

const Column = styled(Box)(({ theme }) => ({
  flex: '0 0 100%',
  padding: theme.spacing(0, 1.5),
  [theme.breakpoints.up('md')]: {
    flex: '0 0 50%',
  },
}));

interface CarSpecificationsModalProps {
  open?: boolean;
  onClose?: () => void;
  carSpecs: any;
  features?: FeatureType[];
  inDialog?: boolean;
}

const CarSpecificationsModal: React.FC<CarSpecificationsModalProps> = ({
  open = true,
  onClose = () => {},
  carSpecs,
  features,
  inDialog = false
}) => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);

  // Группируем особенности по категориям, если они есть
  const groupedFeatures = React.useMemo(() => {
    if (!features || features.length === 0) return {};
    
    return features.reduce((acc: Record<string, FeatureType[]>, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {});
  }, [features]);

  const categoryLabels: Record<string, string> = {
    exterior: 'Экстерьер',
    interior: 'Интерьер',
    comfort: 'Комфорт',
    safety: 'Безопасность',
    tech: 'Технологии',
    performance: 'Динамика',
    technology: 'Технологии'
  };

  // Эффект для симуляции загрузки, если нужно
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Компонент для показа содержимого спецификаций
  const SpecificationsContent = () => (
    <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Загрузка данных...</Typography>
        </Box>
      ) : !carSpecs ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Нет данных о характеристиках автомобиля</Typography>
        </Box>
      ) : (
        <>
          {!inDialog && (
            <Typography variant="h5" gutterBottom>
              {carSpecs.make} {carSpecs.model} ({carSpecs.year})
            </Typography>
          )}
          
          <CategoryTitle variant="h6">
            Основные характеристики
          </CategoryTitle>
          <Divider />
          
          <RowContainer>
            <Column>
              {carSpecs.engine && (
                <SpecItem>
                  <DirectionsCar />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Двигатель
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.engine.type} ({carSpecs.engine.displacement})
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.power && (
                <SpecItem>
                  <Speed />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Мощность
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.power} {carSpecs.engine?.horsepower && `(${carSpecs.engine.horsepower} л.с.)`}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.engine?.torque && (
                <SpecItem>
                  <Animation />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Крутящий момент
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.engine.torque}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
            </Column>
            
            <Column>
              {carSpecs.acceleration && (
                <SpecItem>
                  <Timer />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Разгон
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.acceleration}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.topSpeed && (
                <SpecItem>
                  <Speed />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Максимальная скорость
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.topSpeed}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.transmission && (
                <SpecItem>
                  <WorkspacePremium />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Трансмиссия
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.transmission}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
            </Column>
          </RowContainer>
          
          <CategoryTitle variant="h6">
            Топливо и цвет
          </CategoryTitle>
          <Divider />
          
          <RowContainer>
            <Column>
              {carSpecs.fuel && (
                <SpecItem>
                  <LocalGasStation />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Топливо
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.fuel}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.fuelEconomy && (
                <SpecItem>
                  <LocalGasStation />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Расход топлива
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.fuelEconomy}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
            </Column>
            
            <Column>
              {carSpecs.exteriorColor && (
                <SpecItem>
                  <Palette />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Цвет кузова
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.exteriorColor}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
              
              {carSpecs.interiorColor && (
                <SpecItem>
                  <EventSeat />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Цвет салона
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {carSpecs.interiorColor}
                    </Typography>
                  </Box>
                </SpecItem>
              )}
            </Column>
          </RowContainer>
          
          {carSpecs.dimensions && (
            <>
              <CategoryTitle variant="h6">
                Габариты и масса
              </CategoryTitle>
              <Divider />
              
              <RowContainer>
                <Column>
                  {carSpecs.dimensions.length && carSpecs.dimensions.width && carSpecs.dimensions.height && (
                    <SpecItem>
                      <SquareFoot />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Длина × Ширина × Высота
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {carSpecs.dimensions.length} × {carSpecs.dimensions.width} × {carSpecs.dimensions.height}
                        </Typography>
                      </Box>
                    </SpecItem>
                  )}
                  
                  {carSpecs.dimensions.wheelbase && (
                    <SpecItem>
                      <SquareFoot />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Колесная база
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {carSpecs.dimensions.wheelbase}
                        </Typography>
                      </Box>
                    </SpecItem>
                  )}
                </Column>
                
                <Column>
                  {carSpecs.weight && (
                    <SpecItem>
                      <SquareFoot />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Масса
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {carSpecs.weight}
                        </Typography>
                      </Box>
                    </SpecItem>
                  )}
                </Column>
              </RowContainer>
            </>
          )}
          
          {features && features.length > 0 && (
            <>
              <CategoryTitle variant="h6">
                Оснащение и особенности
              </CategoryTitle>
              <Divider />
              
              <Box sx={{ mt: 2 }}>
                {Object.keys(groupedFeatures).map((category) => (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {categoryLabels[category] || category}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {groupedFeatures[category].map((feature, index) => (
                        <FeatureChip
                          key={index}
                          label={feature.name}
                          className={feature.category}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}
          
          {carSpecs.features && carSpecs.features.length > 0 && !features && (
            <>
              <CategoryTitle variant="h6">
                Оснащение и особенности
              </CategoryTitle>
              <Divider />
              
              <Box sx={{ mt: 2 }}>
                {carSpecs.features.map((feature: string, index: number) => (
                  <Chip
                    key={index}
                    label={feature}
                    sx={{ margin: 0.5 }}
                  />
                ))}
              </Box>
            </>
          )}
        </>
      )}
    </>
  );

  // Если компонент должен быть внутри диалога и открыт
  if (inDialog && open) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ pr: 8 }}>
          Подробные характеристики автомобиля
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <SpecificationsContent />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Если не требуется диалог или диалог закрыт
  if (!inDialog || !open) {
    return open ? <SpecificationsContent /> : null;
  }

  return null;
};

export default CarSpecificationsModal; 