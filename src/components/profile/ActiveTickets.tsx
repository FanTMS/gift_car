import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Button, Skeleton, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { User, Ticket, Raffle } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag } from '@mui/icons-material';
import { getDocs, query, collection, where, orderBy, limit, getDoc, doc } from 'firebase/firestore';
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
  },
}));

const EmptyCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

interface ActiveTicketsProps {
  userId: string | undefined;
}

interface ActiveTicketData {
  id: string;
  title: string;
  ticketNumbers: number[];
  progress: number;
  drawDate: string;
  raffleId: string;
  imageUrl?: string;
}

const ActiveTickets: React.FC<ActiveTicketsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTickets, setActiveTickets] = useState<ActiveTicketData[]>([]);

  // Загружаем активные билеты пользователя
  useEffect(() => {
    const fetchActiveTickets = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Запрашиваем активные билеты пользователя
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('userId', '==', userId),
          where('status', '==', 'active'),
          orderBy('purchaseDate', 'desc')
        );
        
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const ticketsData = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        
        // Для каждого билета получаем данные о розыгрыше
        const ticketsWithRaffleData = await Promise.all(
          ticketsData.map(async (ticket) => {
            try {
              const raffleDoc = await getDoc(doc(db, 'raffles', ticket.raffleId));
              
              if (raffleDoc.exists()) {
                const raffleData = raffleDoc.data() as Raffle;
                const progress = Math.round((raffleData.ticketsSold / raffleData.totalTickets) * 100);
                
                return {
                  id: ticket.id,
                  title: raffleData.title,
                  ticketNumbers: ticket.ticketNumbers,
                  progress: progress,
                  drawDate: raffleData.endDate ? format(raffleData.endDate.toDate(), 'dd MMMM yyyy', { locale: ru }) : 'Не указана',
                  raffleId: ticket.raffleId,
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
        setActiveTickets(ticketsWithRaffleData.filter(ticket => ticket !== null) as ActiveTicketData[]);
      } catch (error) {
        console.error('Error fetching active tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveTickets();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map((item) => (
          <Skeleton 
            key={item} 
            variant="rectangular" 
            width="100%" 
            height={120} 
            sx={{ borderRadius: 2 }} 
          />
        ))}
      </Box>
    );
  }

  if (!activeTickets || activeTickets.length === 0) {
    return (
      <EmptyCard>
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
            <ShoppingBag sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            У вас пока нет активных билетов
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Примите участие в розыгрышах, чтобы билеты появились здесь
          </Typography>
          
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 20,
              px: 3
            }}
          >
            Смотреть розыгрыши
          </Button>
        </Box>
      </EmptyCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {activeTickets.map((ticket) => (
        <Box key={ticket.id}>
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
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    {ticket.ticketNumbers.length > 1 
                      ? `${ticket.ticketNumbers.length} билетов` 
                      : `Билет ${ticket.ticketNumbers[0]}`}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Розыгрыш: {ticket.drawDate}
                </Typography>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={ticket.progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
                      }
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Заполнено {ticket.progress}%
                  </Typography>
                  <Button 
                    size="small" 
                    color="primary" 
                    sx={{ borderRadius: 20, textTransform: 'none' }}
                    onClick={() => navigate(`/raffles/${ticket.raffleId}`)}
                  >
                    Подробнее
                  </Button>
                </Box>
              </CardContent>
            </StatsCard>
          </motion.div>
        </Box>
      ))}
    </Box>
  );
};

export default ActiveTickets; 