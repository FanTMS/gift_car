import React, { useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Button,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Skeleton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Edit, Verified, Telegram } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "../hooks/useMobile";
import { User } from "../../types";

const HeaderContainer = styled(motion.div)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
}));

const ProfileContent = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledAvatar = styled(motion.div)(({ theme }) => ({
  position: "relative",
  margin: theme.spacing(1, 0, 2),
}));

const AvatarImage = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${alpha(theme.palette.common.white, 0.9)}`,
  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.2)}`,
  [theme.breakpoints.down("sm")]: {
    width: 100,
    height: 100,
  },
}));

const Background = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.1,
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 0,
}));

const VerifiedBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 8,
  right: 8,
  zIndex: 2,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  width: "100%",
  marginTop: theme.spacing(2),
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(5),
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: "none",
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  color: theme.palette.common.white,
  backdropFilter: "blur(4px)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
    transform: "translateY(-2px)",
    boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.2)}`,
  },
}));

const cardVariants = {
  collapsed: {
    height: "auto",
  },
  expanded: {
    height: "auto",
  }
};

interface ModernProfileHeaderProps {
  profile: User | null;
  loading?: boolean;
  onEdit: () => void;
  isTelegramUser?: boolean;
}

const ModernProfileHeader: React.FC<ModernProfileHeaderProps> = ({ 
  profile, 
  loading = false, 
  onEdit,
  isTelegramUser = false
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <HeaderContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProfileContent>
          <Skeleton variant="circular" width={isMobile ? 100 : 120} height={isMobile ? 100 : 120} />
          <Skeleton variant="text" width={200} height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
          
          <StatsContainer>
            <StatItem>
              <Skeleton variant="text" width={60} height={30} />
              <Skeleton variant="text" width={60} height={20} />
            </StatItem>
            <StatItem>
              <Skeleton variant="text" width={60} height={30} />
              <Skeleton variant="text" width={60} height={20} />
            </StatItem>
            <StatItem>
              <Skeleton variant="text" width={60} height={30} />
              <Skeleton variant="text" width={60} height={20} />
            </StatItem>
          </StatsContainer>
        </ProfileContent>
      </HeaderContainer>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <HeaderContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      variants={cardVariants}
      transition={{ duration: 0.5 }}
    >
      {profile.photoURL && (
        <Background
          sx={{ backgroundImage: `url(${profile.photoURL})` }}
        />
      )}
      
      <ProfileContent>
        <StyledAvatar>
          <AvatarImage 
            src={profile.photoURL || ''} 
            alt={profile.displayName || 'User'}
            onClick={() => setExpanded(!expanded)}
          />
          
          {profile.verified && (
            <VerifiedBadge>
              <Chip
                icon={<Verified fontSize="small" />}
                label="Проверено"
                size="small"
                color="primary"
                sx={{
                  backgroundColor: alpha(theme.palette.common.white, 0.9),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                }}
              />
            </VerifiedBadge>
          )}
        </StyledAvatar>
        
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {profile.displayName || 'Пользователь'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {profile.username && (
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                px: 1.5,
                py: 0.5,
                borderRadius: 5,
              }}
            >
              @{profile.username}
            </Typography>
          )}
          
          {(profile.telegramId || isTelegramUser) && (
            <Chip
              icon={<Telegram fontSize="small" />}
              label="Telegram"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                color: theme.palette.common.white,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
        
        {profile.bio && (
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              px: 2,
              maxWidth: '80%',
              opacity: 0.9
            }}
          >
            {profile.bio}
          </Typography>
        )}
        
        <StatsContainer>
          <StatItem>
            <Typography variant="h6" fontWeight={700}>
              {profile.stats?.ticketsBought || profile.ticketsTotal || 0}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Билетов
            </Typography>
          </StatItem>
          
          <StatItem>
            <Typography variant="h6" fontWeight={700}>
              {profile.stats?.rafflesWon || profile.wins || 0}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Побед
            </Typography>
          </StatItem>
          
          <StatItem>
            <Typography variant="h6" fontWeight={700}>
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0
              }).format(profile.balance || 0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Баланс
            </Typography>
          </StatItem>
        </StatsContainer>
        
        <Box sx={{ mt: 3 }}>
          <ActionButton
            startIcon={<Edit />}
            onClick={onEdit}
          >
            Редактировать профиль
          </ActionButton>
        </Box>
      </ProfileContent>
    </HeaderContainer>
  );
};

export default ModernProfileHeader; 