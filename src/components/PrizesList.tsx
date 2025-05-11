import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { PrizePlace } from '../types';
import { EmojiEvents } from '@mui/icons-material';
import Grid from '../components/utils/CustomGrid';

interface PrizesListProps {
  prizePlaces: PrizePlace[];
  defaultImage?: string;
}

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

const PlaceChip = styled(Chip)<{ place: number }>(({ theme, place }) => {
  let color = theme.palette.primary.main;
  let backgroundColor;
  
  // Разные цвета для первых трех мест
  if (place === 1) {
    backgroundColor = '#FFD700'; // золото
    color = '#000';
  } else if (place === 2) {
    backgroundColor = '#C0C0C0'; // серебро
    color = '#000';
  } else if (place === 3) {
    backgroundColor = '#CD7F32'; // бронза
    color = '#fff';
  }
  
  return {
    position: 'absolute',
    top: 12,
    right: 12,
    fontWeight: 'bold',
    backgroundColor,
    color,
  };
});

const PrizesList: React.FC<PrizesListProps> = ({ prizePlaces, defaultImage = '/placeholder-prize.jpg' }) => {
  // Сортируем призы по местам
  const sortedPrizes = [...prizePlaces].sort((a, b) => a.place - b.place);
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
        <EmojiEvents sx={{ mr: 1 }} color="primary" />
        Призовые места
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {sortedPrizes.map((prize, index) => (
          <Grid xs={12} sm={6} md={4} key={index}>
            <PrizeCard>
              <Box sx={{ position: 'relative' }}>
                <PrizeImage
                  image={prize.prizeImage || defaultImage}
                  title={prize.prizeTitle}
                />
                <PlaceChip 
                  label={`${prize.place} место`} 
                  place={prize.place}
                />
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>{prize.prizeTitle || `Приз ${prize.place} места`}</Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {prize.description}
                </Typography>
                
                {prize.rangeStart && prize.rangeEnd && (
                  <Typography variant="body2">
                    Диапазон билетов: {prize.rangeStart} - {prize.rangeEnd}
                  </Typography>
                )}
              </CardContent>
            </PrizeCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PrizesList; 