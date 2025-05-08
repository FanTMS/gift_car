import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
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
  EventSeat
} from '@mui/icons-material';

export type FeatureCategory = 'exterior' | 'interior' | 'comfort' | 'safety' | 'tech' | 'performance' | 'technology';

export interface FeatureType {
  name: string;
  category: FeatureCategory;
}

export const asFeatureCategory = (category: string): FeatureCategory => {
  const validCategories: FeatureCategory[] = ['exterior', 'interior', 'comfort', 'safety', 'tech', 'performance', 'technology'];
  return validCategories.includes(category as FeatureCategory) 
    ? (category as FeatureCategory) 
    : 'tech';
};

const SpecificationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

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

const SpecsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  margin: theme.spacing(0, -2),
}));

const SpecsColumn = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(0, 2),
  boxSizing: 'border-box',
  [theme.breakpoints.up('md')]: {
    width: '50%',
  }
}));

interface CarSpecificationsProps {
  specifications?: {
    make: string;
    model: string;
    year: number;
    engine: {
      type: string;
      displacement: string;
      horsepower: number;
      torque: string;
    };
    transmission: string;
    drivetrain: string;
    acceleration: string;
    topSpeed: string;
    power: string;
    fuel: string;
    features: string[];
    exteriorColor: string;
    interiorColor: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      wheelbase: string;
    };
    weight: string;
    fuelEconomy: string;
  };
  features?: FeatureType[];
  engine?: string;
  power?: string;
  acceleration?: string;
  maxSpeed?: string;
  color?: string;
  year?: number;
  carSpecifications?: any;
}

const CarSpecifications: React.FC<CarSpecificationsProps> = ({ 
  specifications, 
  features,
  engine,
  power,
  acceleration,
  maxSpeed,
  color,
  year,
  carSpecifications
}) => {
  const theme = useTheme();
  
  const specs = specifications || carSpecifications;

  if (!specs) {
    return null;
  }

  return (
    <Box>
      <SpecificationCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Основные характеристики
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <SpecsContainer>
          <SpecsColumn>
            <SpecItem>
              <DirectionsCar />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Марка и модель
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.make} {specs.model} ({specs.year})
                </Typography>
              </Box>
            </SpecItem>
            
            <SpecItem>
              <Settings />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Двигатель
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.engine.type} ({specs.engine.displacement})
                </Typography>
              </Box>
            </SpecItem>
            
            <SpecItem>
              <Speed />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Мощность
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.power} ({specs.engine.horsepower} л.с.)
                </Typography>
              </Box>
            </SpecItem>
          </SpecsColumn>
          
          <SpecsColumn>
            <SpecItem>
              <Timer />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Разгон
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.acceleration}
                </Typography>
              </Box>
            </SpecItem>
            
            <SpecItem>
              <LocalGasStation />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Топливо
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.fuel} ({specs.fuelEconomy})
                </Typography>
              </Box>
            </SpecItem>
            
            <SpecItem>
              <Palette />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Цвет
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {specs.exteriorColor} / {specs.interiorColor}
                </Typography>
              </Box>
            </SpecItem>
          </SpecsColumn>
        </SpecsContainer>
      </SpecificationCard>
      
      {features && features.length > 0 && (
        <SpecificationCard>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Комплектация и особенности
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <FeatureChip
                key={index}
                label={feature.name}
                className={feature.category}
              />
            ))}
          </Box>
        </SpecificationCard>
      )}
    </Box>
  );
};

export default CarSpecifications; 