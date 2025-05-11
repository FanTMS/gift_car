import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Stack,
  Divider,
  styled,
  useTheme,
  alpha
} from '@mui/material';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createOrUpdateUserProfile } from '../../firebase/userServices';
import { useUser } from '../../context/UserContext';
import { LocationOn, Telegram as TelegramIcon, Check } from '@mui/icons-material';
import { russianCities } from '../../data/cities';

const TelegramUserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const TelegramLogo = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: '#0088cc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  color: '#FFFFFF',
}));

const VerificationBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  color: theme.palette.success.main,
  padding: theme.spacing(0.5, 1),
  borderRadius: 16,
  fontSize: '0.75rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(0.5),
}));

interface RegistrationDialogProps {
  open: boolean;
  onClose: () => void;
}

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({ open, onClose }) => {
  const { user, profile, refreshProfile } = useUser();
  const [city, setCity] = useState<string | null>(profile?.city || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();

  // Получение данных пользователя из Telegram Mini App
  const getTelegramUserData = () => {
    try {
      if (window.Telegram?.WebApp && (window.Telegram.WebApp as any).initDataUnsafe?.user) {
        return (window.Telegram.WebApp as any).initDataUnsafe.user;
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя Telegram:', error);
    }
    return null;
  };

  const isTelegramMiniApp = (): boolean => {
    return Boolean(window.Telegram?.WebApp);
  };

  const telegramUser = getTelegramUserData();
  const isTelegram = isTelegramMiniApp();

  // Проверяем, заполнено ли обязательное поле города
  const isFormValid = !!city;

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('Пожалуйста, заполните обязательное поле "Город"');
      return;
    }

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Подготавливаем данные профиля для обновления
      const profileData: any = {
        city,
        registered: true,
        updatedAt: Timestamp.now()
      };

      // Если запущено в Telegram, добавляем данные пользователя из Telegram
      if (isTelegram && telegramUser) {
        profileData.displayName = telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : '');
        profileData.photoURL = telegramUser.photo_url;
        profileData.telegramId = telegramUser.id.toString();
        profileData.username = telegramUser.username;
        profileData.verified = true;
      }

      // Обновляем профиль пользователя
      await createOrUpdateUserProfile(user.uid, profileData);
      
      // Обновляем профиль в контексте
      await refreshProfile();
      
      // Показываем сообщение об успехе
      setSuccess(true);
      
      // Закрываем диалог после короткой задержки
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError('Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={true}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Регистрация
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Для продолжения необходимо завершить регистрацию
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {isTelegram && telegramUser && (
            <TelegramUserSection>
              <TelegramLogo>
                <TelegramIcon fontSize="large" />
              </TelegramLogo>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {telegramUser.first_name} {telegramUser.last_name || ''}
                </Typography>
                
                {telegramUser.username && (
                  <Typography variant="body2" color="text.secondary">
                    @{telegramUser.username}
                  </Typography>
                )}
                
                <VerificationBadge>
                  <Check fontSize="small" sx={{ mr: 0.5 }} />
                  Подтверждено через Telegram
                </VerificationBadge>
              </Box>
            </TelegramUserSection>
          )}
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Autocomplete
              value={city}
              onChange={(event: any, newValue: string | null) => {
                setCity(newValue);
              }}
              options={russianCities}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Город *"
                  variant="outlined"
                  required
                  fullWidth
                  error={!!error && !city}
                  helperText={!city && !!error ? "Это поле обязательно" : ""}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <LocationOn color="action" sx={{ ml: 1, mr: -0.5 }} />
                    ),
                  }}
                />
              )}
            />
          </Stack>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Регистрация успешно завершена!
            </Alert>
          )}
        </form>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid || loading || success}
          fullWidth
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Завершить регистрацию'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDialog; 