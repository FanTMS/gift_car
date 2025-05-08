import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Button, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag } from '@mui/icons-material';

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
  backgroundColor: 'var(--tg-theme-secondary-bg-color, #1e1e1e)',
  color: 'var(--tg-theme-text-color, #ffffff)',
}));

interface ActiveTicketsProps {
  profile: User | null;
  loading: boolean;
}

const ActiveTickets: React.FC<ActiveTicketsProps> = ({ profile, loading }) => {
  const navigate = useNavigate();

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

  if (!profile || !profile.activeTickets || profile.activeTickets.length === 0) {
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
              backgroundColor: 'rgba(33, 150, 243, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2, 
            }}
          >
            <ShoppingBag sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1, color: 'var(--tg-theme-text-color, #ffffff)' }}>
            У вас пока нет активных билетов
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'var(--tg-theme-hint-color, #8c8c8c)' }}>
            Примите участие в розыгрышах, чтобы билеты появились здесь
          </Typography>
          
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 20,
              px: 3,
              backgroundColor: 'var(--tg-theme-button-color, #1976D2)',
              color: 'var(--tg-theme-button-text-color, #ffffff)'
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
      {profile.activeTickets.map((ticket) => (
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
                    {ticket.car || ticket.title}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    Билет {ticket.ticketNumber}
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