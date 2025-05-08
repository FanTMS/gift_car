import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Divider, Avatar, Chip, Skeleton } from '@mui/material';
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
  Tag
} from '@mui/icons-material';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(3),
  backgroundColor: 'var(--tg-theme-secondary-bg-color, #1e1e1e)',
  color: 'var(--tg-theme-text-color, #ffffff)',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 40,
  color: theme.palette.primary.main,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  color: 'var(--tg-theme-text-color, #ffffff)',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -8,
    width: 40,
    height: 3,
    backgroundColor: 'var(--tg-theme-button-color, #1976D2)',
    borderRadius: 3,
  },
}));

interface ProfileInfoProps {
  profile: User | null;
  loading: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={150} height={30} sx={{ mb: 3 }} />
        <InfoCard>
          <CardContent>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
            ))}
          </CardContent>
        </InfoCard>

        <Skeleton variant="text" width={150} height={30} sx={{ mb: 3 }} />
        <InfoCard>
          <CardContent>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
            ))}
          </CardContent>
        </InfoCard>
      </Box>
    );
  }

  if (!profile) {
    return <Box sx={{ textAlign: 'center', py: 5 }}><Typography>Профиль не найден</Typography></Box>;
  }

  return (
    <Box>
      <SectionTitle variant="h6">Личная информация</SectionTitle>
      <InfoCard>
        <CardContent>
          {(profile.firstName || profile.lastName) && (
            <InfoItem>
              <IconWrapper>
                <Avatar 
                  sx={{ width: 32, height: 32, backgroundColor: 'primary.light' }}
                >
                  {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
                </Avatar>
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Имя</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {`${profile.firstName || ''} ${profile.lastName || ''}`}
                </Typography>
              </Box>
            </InfoItem>
          )}

          {(profile.city || profile.country) && (
            <InfoItem>
              <IconWrapper>
                <LocationOn />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Местоположение</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            </InfoItem>
          )}
          
          {profile.birthDate && (
            <InfoItem>
              <IconWrapper>
                <Cake />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Дата рождения</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {formatDate(profile.birthDate.toDate())}
                </Typography>
              </Box>
            </InfoItem>
          )}
          
          {profile.language && (
            <InfoItem>
              <IconWrapper>
                <Translate />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Язык</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {profile.language}
                </Typography>
              </Box>
            </InfoItem>
          )}
          
          {profile.phone && (
            <InfoItem>
              <IconWrapper>
                <Phone />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Телефон</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {profile.phone}
                </Typography>
              </Box>
            </InfoItem>
          )}
          
          {profile.email && (
            <InfoItem>
              <IconWrapper>
                <Email />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Email</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {profile.email}
                </Typography>
              </Box>
            </InfoItem>
          )}
          
          {profile.lastLogin && (
            <InfoItem>
              <IconWrapper>
                <AccessTime />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Последний вход</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {formatDate(profile.lastLogin.toDate())}
                </Typography>
              </Box>
            </InfoItem>
          )}
        </CardContent>
      </InfoCard>

      <SectionTitle variant="h6">Статистика участия</SectionTitle>
      <InfoCard>
        <CardContent>
          <InfoItem>
            <IconWrapper>
              <ConfirmationNumber />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Всего купленных билетов</Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                {profile.stats?.ticketsBought ?? profile.ticketsTotal ?? 0}
              </Typography>
            </Box>
          </InfoItem>

          <InfoItem>
            <IconWrapper>
              <MonetizationOn />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Потрачено на билеты</Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                {profile.stats?.totalSpent ?? 0} ₽
              </Typography>
            </Box>
          </InfoItem>

          <InfoItem>
            <IconWrapper>
              <EmojiEvents />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Выигрышей</Typography>
              <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                {profile.stats?.rafflesWon ?? profile.wins ?? 0}
              </Typography>
            </Box>
          </InfoItem>

          {profile.referralCode && (
            <InfoItem>
              <IconWrapper>
                <Tag />
              </IconWrapper>
              <Box>
                <Typography variant="subtitle2" color="var(--tg-theme-text-color, #ffffff)">Реферальный код</Typography>
                <Typography variant="body2" color="var(--tg-theme-hint-color, #8c8c8c)">
                  {profile.referralCode}
                </Typography>
              </Box>
            </InfoItem>
          )}
        </CardContent>
      </InfoCard>
    </Box>
  );
};

export default ProfileInfo; 