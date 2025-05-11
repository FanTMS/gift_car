import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ConfirmationNumber, History } from '@mui/icons-material';

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

const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  backgroundColor: 'var(--tg-theme-secondary-bg-color, #1e1e1e)',
  color: 'var(--tg-theme-text-color, #ffffff)',
}));

const EmptyHistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: 'var(--tg-theme-secondary-bg-color, #1e1e1e)',
  color: 'var(--tg-theme-text-color, #ffffff)',
}));

const TicketItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

interface TicketHistoryProps {
  profile: User | null;
  loading: boolean;
}

const TicketHistory: React.FC<TicketHistoryProps> = ({ profile, loading }) => {
  const navigate = useNavigate();

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

  if (!profile || !profile.historyTickets || profile.historyTickets.length === 0) {
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
              backgroundColor: 'rgba(33, 150, 243, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2, 
            }}
          >
            <History sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1, color: 'var(--tg-theme-text-color, #ffffff)' }}>
            История билетов пуста
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'var(--tg-theme-hint-color, #8c8c8c)' }}>
            Информация о ваших билетах появится здесь после участия
          </Typography>
        </Box>
      </EmptyHistoryCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {profile.historyTickets.map((ticket) => (
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
                    {ticket.car || ticket.title}
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
                    Билет {ticket.ticketNumber}
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