import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { User, Ticket, Raffle, Winner } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ConfirmationNumber, History } from '@mui/icons-material';
import { getDocs, query, collection, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  height: '100%',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    cursor: 'pointer',
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
}));

const EmptyHistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const TicketItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

interface TicketHistoryProps {
  userId: string | undefined;
}

interface HistoryTicketData {
  id: string;
  title: string;
  ticketNumbers: number[];
  status: string;
  drawDate: string;
  raffleId: string;
  prize?: string;
  imageUrl?: string;
}

const TicketHistory: React.FC<TicketHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyTickets, setHistoryTickets] = useState<HistoryTicketData[]>([]);

  // Загружаем историю билетов пользователя
  useEffect(() => {
    const fetchTicketHistory = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Запрашиваем историю билетов пользователя (использованные или отмененные)
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('userId', '==', userId),
          where('status', 'in', ['used', 'cancelled']),
          orderBy('purchaseDate', 'desc')
        );
        
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const ticketsData = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        
        // Получаем список выигрышей пользователя
        const winnersQuery = query(
          collection(db, 'winners'),
          where('userId', '==', userId)
        );
        
        const winnersSnapshot = await getDocs(winnersQuery);
        const winnersData = winnersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Winner[];
        
        // Для каждого билета получаем данные о розыгрыше
        const ticketsWithRaffleData = await Promise.all(
          ticketsData.map(async (ticket) => {
            try {
              const raffleDoc = await getDoc(doc(db, 'raffles', ticket.raffleId));
              
              if (raffleDoc.exists()) {
                const raffleData = raffleDoc.data() as Raffle;
                
                // Проверяем, был ли этот билет выигрышным
                const winningTicket = winnersData.find(winner => 
                  winner.raffleId === ticket.raffleId && 
                  ticket.ticketNumbers.includes(winner.ticketNumber)
                );
                
                // Определяем статус билета
                let status: string = ticket.status as string;
                if (winningTicket) {
                  status = 'won';
                } else if (status === 'used' && raffleData.status === 'completed') {
                  status = 'lost';
                }
                
                return {
                  id: ticket.id,
                  title: raffleData.title,
                  ticketNumbers: ticket.ticketNumbers,
                  status: status,
                  drawDate: raffleData.endDate 
                    ? format(raffleData.endDate.toDate(), 'dd MMMM yyyy', { locale: ru }) 
                    : 'Дата не указана',
                  raffleId: ticket.raffleId,
                  prize: winningTicket?.prizeTitle,
                  imageUrl: raffleData.images?.[0] || undefined
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching raffle data for ticket:', error);
              return null;
            }
          })
        );
        
        // Фильтруем null значения
        setHistoryTickets(ticketsWithRaffleData.filter(ticket => ticket !== null) as HistoryTicketData[]);
      } catch (error) {
        console.error('Error fetching ticket history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketHistory();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'success';
      case 'lost':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'won':
        return 'Выигрыш';
      case 'lost':
        return 'Не выиграл';
      case 'cancelled':
        return 'Отменен';
      case 'used':
        return 'Участвовал';
      default:
        return 'Участвовал';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map((item) => (
          <Skeleton 
            key={item} 
            variant="rectangular" 
            width="100%" 
            height={100} 
            sx={{ borderRadius: 2 }} 
          />
        ))}
      </Box>
    );
  }

  if (!historyTickets || historyTickets.length === 0) {
    return (
      <EmptyHistoryCard>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: alpha('#2196F3', 0.1), 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2, 
            }}
          >
            <History sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            История билетов пуста
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Информация о ваших билетах появится здесь после участия
          </Typography>
        </Box>
      </EmptyHistoryCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {historyTickets.map((ticket) => (
        <Box key={ticket.id} onClick={() => navigate(`/raffles/${ticket.raffleId}`)}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatsCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {ticket.title}
                  </Typography>
                  <Chip 
                    label={getStatusLabel(ticket.status)} 
                    size="small" 
                    color={getStatusColor(ticket.status)}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.ticketNumbers.length > 1 
                      ? `${ticket.ticketNumbers.length} билетов` 
                      : `Билет ${ticket.ticketNumbers[0]}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.drawDate}
                  </Typography>
                </Box>
                {ticket.status === 'won' && ticket.prize && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      Выигрыш: {ticket.prize}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StatsCard>
          </motion.div>
        </Box>
      ))}
    </Box>
  );
};

export default TicketHistory; 