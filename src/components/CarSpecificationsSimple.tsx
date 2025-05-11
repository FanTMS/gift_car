import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  styled
} from '@mui/material';
import {
  DirectionsCar,
  Speed,
  Timer,
  LocalGasStation
} from '@mui/icons-material';

const SpecItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
  }
}));

interface CarSpecificationsSimpleProps {
  make?: string;
  model?: string;
  year?: number;
  engine?: string;
  power?: string;
  acceleration?: string;
  topSpeed?: string;
  fuel?: string;
}

const CarSpecificationsSimple: React.FC<CarSpecificationsSimpleProps> = ({
  make,
  model,
  year,
  engine,
  power,
  acceleration,
  topSpeed,
  fuel
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
      {power && (
        <SpecItem>
          <Speed />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Мощность
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {power}
            </Typography>
          </Box>
        </SpecItem>
      )}
      
      {engine && (
        <SpecItem>
          <DirectionsCar />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Двигатель
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {engine}
            </Typography>
          </Box>
        </SpecItem>
      )}
      
      {acceleration && (
        <SpecItem>
          <Timer />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Разгон
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {acceleration}
            </Typography>
          </Box>
        </SpecItem>
      )}
      
      {fuel && (
        <SpecItem>
          <LocalGasStation />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Топливо
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {fuel}
            </Typography>
          </Box>
        </SpecItem>
      )}
    </Stack>
  );
};

export default CarSpecificationsSimple; 