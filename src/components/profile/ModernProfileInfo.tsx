import React from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  useTheme, 
  Skeleton,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LocationOn, 
  Cake, 
  Translate, 
  Phone, 
  Email,
  AccessTime,
  ConfirmationNumber,
  MonetizationOn,
  EmojiEvents,
  Tag,
  Person,
  CalendarMonth,
  Public,
  Badge,
  Telegram
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../hooks/useMobile';

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&::after': {
    content: '""',
    display: 'block',
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  }
}));

const InfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  overflow: 'visible',
  height: '100%',
}));

const InfoItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

const FlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  width: '100%',
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  }
}));

const FlexColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: '250px',
  [theme.breakpoints.down('sm')]: {
    flexBasis: '100%',
  }
}));

interface ModernProfileInfoProps {
  profile: User | null;
  loading: boolean;
}

const ModernProfileInfo: React.FC<ModernProfileInfoProps> = ({ profile, loading }) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.2, 0.8, 0.2, 1]
      }
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        
        <FlexContainer>
          <FlexColumn>
            <InfoCard>
              <CardHeader>
                <Skeleton variant="text" width={150} height={32} />
              </CardHeader>
              <CardContent>
                {[1, 2, 3].map((item) => (
                  <InfoItemContainer key={item}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="60%" height={24} />
                    </Box>
                  </InfoItemContainer>
                ))}
              </CardContent>
            </InfoCard>
          </FlexColumn>
          
          <FlexColumn>
            <InfoCard>
              <CardHeader>
                <Skeleton variant="text" width={150} height={32} />
              </CardHeader>
              <CardContent>
                {[1, 2, 3].map((item) => (
                  <InfoItemContainer key={item}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="60%" height={24} />
                    </Box>
                  </InfoItemContainer>
                ))}
              </CardContent>
            </InfoCard>
          </FlexColumn>
        </FlexContainer>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 5, 
        backgroundColor: alpha(theme.palette.error.main, 0.05),
        borderRadius: 2
      }}>
        <Typography>Профиль не найден</Typography>
      </Box>
    );
  }

  const personalInfoItems = [
    {
      icon: <Person />,
      title: 'Полное имя',
      value: `${profile.firstName || ''} ${profile.lastName || ''}`,
      visible: !!(profile.firstName || profile.lastName)
    },
    {
      icon: <LocationOn />,
      title: 'Местоположение',
      value: [profile.city, profile.country].filter(Boolean).join(', '),
      visible: !!(profile.city || profile.country)
    },
    {
      icon: <Cake />,
      title: 'Дата рождения',
      value: profile.birthDate ? formatDate(profile.birthDate.toDate()) : '',
      visible: !!profile.birthDate
    },
    {
      icon: <Email />,
      title: 'Email',
      value: profile.email || '',
      visible: !!profile.email
    },
    {
      icon: <Phone />,
      title: 'Телефон',
      value: profile.phone || '',
      visible: !!profile.phone
    },
    {
      icon: <Translate />,
      title: 'Язык',
      value: profile.language || '',
      visible: !!profile.language
    }
  ].filter(item => item.visible);

  const accountInfoItems = [
    {
      icon: <Telegram />,
      title: 'Telegram ID',
      value: profile.telegramId || '',
      visible: !!profile.telegramId
    },
    {
      icon: <Tag />,
      title: 'Реферальный код',
      value: profile.referralCode || '',
      visible: !!profile.referralCode
    },
    {
      icon: <AccessTime />,
      title: 'Последний вход',
      value: profile.lastLogin ? formatDate(profile.lastLogin.toDate()) : '',
      visible: !!profile.lastLogin
    }
  ].filter(item => item.visible);

  const statisticsItems = [
    {
      icon: <ConfirmationNumber />,
      title: 'Всего купленных билетов',
      value: `${profile.stats?.ticketsBought ?? profile.ticketsTotal ?? 0}`,
      visible: true
    },
    {
      icon: <MonetizationOn />,
      title: 'Потрачено на билеты',
      value: `${profile.stats?.totalSpent ?? 0} ₽`,
      visible: true
    },
    {
      icon: <EmojiEvents />,
      title: 'Выигрышей',
      value: `${profile.stats?.rafflesWon ?? profile.wins ?? 0}`,
      visible: true
    }
  ];

  const renderInfoItems = (items: any[]) => {
    return items.map((item, index) => (
      <motion.div 
        key={index}
        variants={itemVariants}
      >
        <InfoItemContainer>
          <IconBox>
            {item.icon}
          </IconBox>
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 500, fontSize: '0.8rem' }}
            >
              {item.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ fontWeight: 600 }}
            >
              {item.value || 'Не указано'}
            </Typography>
          </Box>
        </InfoItemContainer>
      </motion.div>
    ));
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      <FlexContainer>
        <FlexColumn>
          <motion.div variants={itemVariants}>
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="primary" />
                    Личная информация
                  </Box>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalInfoItems.length > 0 ? (
                  renderInfoItems(personalInfoItems)
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Информация не заполнена
                  </Typography>
                )}
              </CardContent>
            </InfoCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge fontSize="small" color="primary" />
                    Аккаунт
                  </Box>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accountInfoItems.length > 0 ? (
                  renderInfoItems(accountInfoItems)
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Информация не заполнена
                  </Typography>
                )}
              </CardContent>
            </InfoCard>
          </motion.div>
        </FlexColumn>

        <FlexColumn>
          <motion.div variants={itemVariants}>
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents fontSize="small" color="primary" />
                    Статистика участия
                  </Box>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderInfoItems(statisticsItems)}
              </CardContent>
            </InfoCard>
          </motion.div>
        </FlexColumn>
      </FlexContainer>
    </motion.div>
  );
};

export default ModernProfileInfo; 