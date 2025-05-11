import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Winner, Raffle, PrizePlace } from '../types';
import { formatDate } from '../utils/formatters';
import { EmojiEvents } from '@mui/icons-material';

// Расширенный интерфейс для победителя с UI данными
interface ExtendedWinner extends Winner {
  userData?: {
    displayName?: string;
    photoURL?: string;
  };
}

interface WinnersListProps {
  winners: ExtendedWinner[];
  raffle: Raffle;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
    backgroundColor,
    color,
    fontWeight: 'bold'
  };
});

const WinnersList: React.FC<WinnersListProps> = ({ winners, raffle }) => {
  // Находим соответствующий приз для победителя на основе места
  const getPrizeTitle = (winner: ExtendedWinner): string => {
    if (!raffle.isMultiPrize || !raffle.prizePlaces) {
      return raffle.title; // Если это обычный розыгрыш, возвращаем название розыгрыша
    }
    
    // Если у победителя есть прописанное место и название приза, используем их
    if (winner.place && winner.prizeTitle) {
      return winner.prizeTitle;
    }
    
    // Иначе ищем приз по месту в списке призов
    if (winner.place) {
      const prize = raffle.prizePlaces.find(p => p.place === winner.place);
      if (prize) {
        return prize.prizeTitle || `Приз за ${winner.place} место`;
      }
    }
    
    return 'Приз';
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
        <EmojiEvents sx={{ mr: 1 }} color="primary" />
        Победители розыгрыша
      </Typography>
      
      {winners.length > 0 ? (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Место</TableCell>
                <TableCell>Участник</TableCell>
                <TableCell>Номер билета</TableCell>
                <TableCell>Приз</TableCell>
                <TableCell>Дата выигрыша</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {winners.map((winner) => (
                <TableRow key={winner.id}>
                  <TableCell>
                    {winner.place ? (
                      <PlaceChip 
                        label={`${winner.place} место`} 
                        place={winner.place}
                        size="small"
                      />
                    ) : (
                      '1'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={winner.userData?.photoURL} 
                        sx={{ mr: 1 }}
                        alt={winner.userData?.displayName || 'Участник'}
                      >
                        {winner.userData?.displayName?.[0] || 'У'}
                      </Avatar>
                      <Typography>{winner.userData?.displayName || 'Участник'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{winner.ticketNumber}</TableCell>
                  <TableCell>{getPrizeTitle(winner)}</TableCell>
                  <TableCell>{formatDate(winner.winDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      ) : (
        <Typography variant="body1">Информация о победителях еще не объявлена.</Typography>
      )}
    </Box>
  );
};

export default WinnersList; 