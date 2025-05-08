import React from 'react';
import { Box, Typography, Avatar, Paper, Button, Skeleton, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, Verified, Telegram } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { User } from '../../types';

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  marginBottom: theme.spacing(3),
  background: 'var(--tg-theme-secondary-bg-color, #1e1e1e)',
  color: 'var(--tg-theme-text-color, #ffffff)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: 100,
    height: 100,
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(-1.5),
  marginRight: theme.spacing(-1.5),
  width: '100%',
}));

const StatBox = styled(Box)(({ theme }) => ({
  width: '33.33%',
  padding: theme.spacing(0, 1.5),
  marginBottom: theme.spacing(2),
}));

interface ProfileHeaderProps {
  profile: User | null;
  loading: boolean;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, loading, onEditProfile }) => {
  if (loading) {
    return (
      <Header elevation={0}>
        <Skeleton variant="circular" width={120} height={120} />
        <Skeleton variant="text" width={200} height={40} sx={{ my: 1 }} />
        <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 20, mb: 2 }} />
        <StatsContainer>
          <StatBox>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="80%" height={20} />
          </StatBox>
          <StatBox>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="80%" height={20} />
          </StatBox>
          <StatBox>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="80%" height={20} />
          </StatBox>
        </StatsContainer>
      </Header>
    );
  }

  if (!profile) {
    return <Box sx={{ textAlign: 'center', py: 5 }}><Typography>Профиль не найден</Typography></Box>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Header elevation={0}>
        <Box sx={{ position: 'relative' }}>
          <StyledAvatar src={profile.photoURL} alt={profile.displayName || 'Пользователь'} />
          {profile.verified && (
            <Chip 
              icon={<Verified fontSize="small" />} 
              label="Проверено" 
              size="small"
              color="primary"
              sx={{ 
                position: 'absolute', 
                bottom: 5, 
                right: -20,
                fontSize: '0.7rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          )}
        </Box>
        
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: 'var(--tg-theme-text-color, #ffffff)' }}>
          {profile.displayName || 'Пользователь'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          {profile.username && (
            <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">@{profile.username}</Typography>
          )}
          {profile.telegramId && profile.username && (
            <Chip 
              icon={<Telegram fontSize="small" />} 
              label="Telegram" 
              size="small"
              variant="outlined"
              color="info"
              sx={{ ml: 1, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        
        {profile.bio && (
          <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)" sx={{ mb: 2, px: 2 }}>
            {profile.bio}
          </Typography>
        )}
        
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<Edit />}
          sx={{ 
            borderRadius: 20, 
            mb: 2,
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            borderColor: 'var(--tg-theme-button-color, #1976D2)' 
          }}
          onClick={onEditProfile}
        >
          Редактировать
        </Button>
        
        <StatsContainer>
          <StatBox>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--tg-theme-link-color, #64B5F6)' }}>
                {profile.stats?.ticketsBought ?? profile.ticketsTotal ?? 0}
              </Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">Билетов</Typography>
            </Box>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--tg-theme-link-color, #64B5F6)' }}>
                {profile.stats?.rafflesWon ?? profile.wins ?? 0}
              </Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">Побед</Typography>
            </Box>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--tg-theme-link-color, #64B5F6)' }}>
                {profile.wallet?.balance ?? profile.balance ?? 0} ₽
              </Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">Баланс</Typography>
            </Box>
          </StatBox>
        </StatsContainer>
      </Header>
    </motion.div>
  );
};

export default ProfileHeader; 