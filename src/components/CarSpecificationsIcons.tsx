import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  styled
} from '@mui/material';
import {
  Speed,
  Timer,
  DirectionsCar,
  LocalGasStation,
  CalendarToday
} from '@mui/icons-material';

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  '& svg': {
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const SpecContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const SpecItem = styled(Box)(({ theme }) => ({
  flex: '0 0 33.333%',
  [theme.breakpoints.up('sm')]: {
    flex: '0 0 16.666%',
  },
  padding: theme.spacing(1),
  boxSizing: 'border-box',
}));

interface CarSpecificationsIconsProps {
  engine?: string;
  power?: string;
  acceleration?: string;
  maxSpeed?: string;
  fuel?: string;
  year?: string | number;
  color?: string;
  carSpecifications?: any;
}

const CarSpecificationsIcons: React.FC<CarSpecificationsIconsProps> = ({
  engine,
  power,
  acceleration,
  maxSpeed,
  fuel,
  year
}) => {
  const theme = useTheme();

  return (
    <SpecContainer>
      {power && (
        <SpecItem>
          <IconBox>
            <Speed />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {power}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Мощность
            </Typography>
          </IconBox>
        </SpecItem>
      )}
      
      {engine && (
        <SpecItem>
          <IconBox>
            <DirectionsCar />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {engine}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Двигатель
            </Typography>
          </IconBox>
        </SpecItem>
      )}
      
      {acceleration && (
        <SpecItem>
          <IconBox>
            <Timer />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {acceleration}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Разгон
            </Typography>
          </IconBox>
        </SpecItem>
      )}
      
      {maxSpeed && (
        <SpecItem>
          <IconBox>
            <Speed />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {maxSpeed}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Макс. скорость
            </Typography>
          </IconBox>
        </SpecItem>
      )}
      
      {fuel && (
        <SpecItem>
          <IconBox>
            <LocalGasStation />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {fuel}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Топливо
            </Typography>
          </IconBox>
        </SpecItem>
      )}
      
      {year && (
        <SpecItem>
          <IconBox>
            <CalendarToday />
            <Typography variant="body2" textAlign="center" fontWeight={500}>
              {year}
            </Typography>
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Год выпуска
            </Typography>
          </IconBox>
        </SpecItem>
      )}
    </SpecContainer>
  );
};

export default CarSpecificationsIcons; 