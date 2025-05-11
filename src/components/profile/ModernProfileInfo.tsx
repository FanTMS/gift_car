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
  Telegram,
  AccountBalanceWallet
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../hooks/useMobile';

// Константа с base64 иконкой TON
const tonLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iIzAzODhDQyIvPgo8cGF0aCBkPSJNMTYuNjA5MSAxOS41ODIzTDI1LjEyNTIgMTYuMDIzOUwyMS45Njc1IDI0LjIzMDVMMTYuNjA5MSAxOS41ODIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyMkwyMC43NzAzIDEzLjMwNDdMMjUuMTI1MSAxNi4wMjM5TDE2LjYwOTEgMTkuNTgyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMy45MTAyIDI2LjA4NjNMMTYuNjA5MSAxOS41ODIzTDIxLjk2NzUgMjQuMjMwNUwxMy45MTAyIDI2LjA4NjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTMuOTEwMiAyNi4wODYzTDEzLjc3NzMgMTguMjg5NkwxNi42MDkxIDE5LjU4MjNMMTMuOTEwMiAyNi4wODYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjYwOTEgMTkuNTgyM0wxMy43NzczIDE4LjI4OTZMMjAuNzcwMyAxMy4zMDQ3TDE2LjYwOTEgMTkuNTgyM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

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

const TonIconBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: alpha('#0388CC', 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  flexShrink: 0,
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
      customIcon: (
        <TonIconBox>
          <Box
            component="img"
            src={tonLogoBase64}
            alt="TON"
            sx={{ width: 24, height: 24 }}
          />
        </TonIconBox>
      ),
      title: 'TON кошелек',
      value: profile.wallet?.walletAddress 
        ? `${profile.wallet.walletAddress.slice(0, 6)}...${profile.wallet.walletAddress.slice(-6)}`
        : 'Не подключен',
      visible: true
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

  const userStatsItems = [
    {
      icon: <ConfirmationNumber />,
      title: 'Купленных билетов',
      value: profile.stats?.ticketsBought || 0,
      visible: true
    },
    {
      icon: <MonetizationOn />,
      title: 'Потрачено на билеты',
      value: new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(profile.stats?.totalSpent || 0),
      visible: true
    },
    {
      icon: <EmojiEvents />,
      title: 'Выигрышей',
      value: profile.stats?.rafflesWon || 0,
      visible: true
    },
    {
      icon: <AccountBalanceWallet />,
      title: 'Баланс',
      value: new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(profile.balance || 0),
      visible: true
    }
  ].filter(item => item.visible);

  const renderInfoItems = (items: any[]) => {
    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Нет данных
        </Typography>
      );
    }
    
    return items.map((item, index) => (
      <InfoItemContainer key={index}>
        {item.customIcon || (
          <IconBox>
            {item.icon}
          </IconBox>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {item.title}
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {item.value || 'Не указано'}
          </Typography>
        </Box>
      </InfoItemContainer>
    ));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <SectionTitle>
          Личные данные
        </SectionTitle>
      </motion.div>
      
      <FlexContainer>
        <FlexColumn>
          <motion.div variants={itemVariants}>
            <InfoCard>
              <CardHeader>
                <CardTitle>Персональная информация</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInfoItems(personalInfoItems)}
              </CardContent>
            </InfoCard>
          </motion.div>
        </FlexColumn>
        
        <FlexColumn>
          <motion.div variants={itemVariants}>
            <InfoCard>
              <CardHeader>
                <CardTitle>Аккаунт и кошельки</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInfoItems(accountInfoItems)}
              </CardContent>
            </InfoCard>
          </motion.div>
        </FlexColumn>
      </FlexContainer>
      
      <motion.div variants={itemVariants}>
        <SectionTitle>
          Статистика
        </SectionTitle>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <InfoCard>
          <CardHeader>
            <CardTitle>Статистика участия</CardTitle>
          </CardHeader>
          <CardContent>
            <FlexContainer>
              {userStatsItems.map((item, index) => (
                <FlexColumn key={index} sx={{ flex: '1 1 20%', minWidth: '180px' }}>
                  <InfoItemContainer>
                    <IconBox>
                      {item.icon}
                    </IconBox>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.value}
                      </Typography>
                    </Box>
                  </InfoItemContainer>
                </FlexColumn>
              ))}
            </FlexContainer>
          </CardContent>
        </InfoCard>
      </motion.div>
    </motion.div>
  );
};

export default ModernProfileInfo; 