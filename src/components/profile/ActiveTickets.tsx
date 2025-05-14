import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Button, Skeleton, alpha, Paper, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { User, Ticket, Raffle } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag, CalendarMonth, AccessTimeFilled, LocalActivity } from '@mui/icons-material';
import { getDocs, query, collection, where, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const StatsCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.04)}`,
  padding: theme.spacing(0.5),
  height: '100%',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
    borderColor: alpha(theme.palette.primary.main, 0.15),
  },
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.5),
  '&:last-child': {
    paddingBottom: theme.spacing(2.5)
  },
}));

const EmptyCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.04)}`,
  padding: theme.spacing(6, 3),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
}));

const TicketNumberChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(0.8),
  marginTop: theme.spacing(1.5),
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {[1, 2, 3].map((item) => (
          <Skeleton 
            key={item} 
            variant="rectangular" 
            width="100%" 
            height={140} 
            sx={{ borderRadius: 3 }} 
          />
        ))}
      </Box>
    );
  }

  if (!activeTickets || activeTickets.length === 0) {
    return (
      <EmptyCard elevation={0}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              width: 90, 
              height: 90, 
              borderRadius: '50%', 
              backgroundColor: alpha('#2196F3', 0.08), 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3, 
            }}
          >
            <ShoppingBag sx={{ fontSize: 45, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            У вас пока нет активных билетов
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 360, mx: 'auto' }}>
            Примите участие в розыгрышах, чтобы билеты появились здесь
          </Typography>
          
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 6,
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(33, 150, 243, 0.2)'
            }}
          >
            Смотреть розыгрыши
          </Button>
        </Box>
      </EmptyCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {activeTickets.map((ticket) => (
        <Box key={ticket.id}>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StatsCard elevation={0}>
              <CardContentStyled>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {ticket.title}
                  </Typography>
                  
                  <TicketNumberChip 
                    icon={<LocalActivity fontSize="small" />}
                    label={ticket.ticketNumbers.length > 1 
                      ? `${ticket.ticketNumbers.length} билетов` 
                      : `Билет ${ticket.ticketNumbers[0]}`}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary', mr: 0.8 }} />
                  <Typography variant="body2" color="text.secondary">
                    Розыгрыш: {ticket.drawDate}
                  </Typography>
                </Box>
                
                <ProgressBarContainer>
                  <LinearProgress 
                    variant="determinate" 
                    value={ticket.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(33, 150, 243, 0.15)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
                      }
                    }}
                  />
                </ProgressBarContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={500} color="primary.main">
                    Заполнено {ticket.progress}%
                  </Typography>
                  <Button 
                    size="medium" 
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 6, 
                      textTransform: 'none',
                      px: 2.5,
                      borderColor: alpha('#2196F3', 0.3)
                    }}
                    onClick={() => navigate(`/raffles/${ticket.raffleId}`)}
                  >
                    Подробнее
                  </Button>
                </Box>
              </CardContentStyled>
            </StatsCard>
          </motion.div>
        </Box>
      ))}
    </Box>
  );
};

export default ActiveTickets; 