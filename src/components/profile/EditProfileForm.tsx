import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, CloudUpload } from '@mui/icons-material';
import { User } from '../../types';
import { updateUserProfile } from '../../firebase/userServices';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
  margin: '0 auto 16px',
}));

interface EditProfileFormProps {
  open: boolean;
  onClose: () => void;
  profile: User | null;
  onProfileUpdated: () => Promise<void>;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ open, onClose, profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const { id, ...profileData } = profile;
      setFormData(profileData);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    setFormData((prev) => {
      // Для вложенных полей, как preferences.theme
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as object || {}),
            [child]: value,
          },
        };
      }
      
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    
    setFormData((prev) => {
      // Для вложенных полей, как notifications
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as object || {}),
            [child]: value,
          },
        };
      }
      
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      
      // Создаем превью для отображения
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !profile?.id) return null;
    
    try {
      console.log('Начинаем загрузку аватара...');
      // Создаем уникальное имя файла на основе ID пользователя и текущего времени
      const fileName = `${profile.id}/${Date.now()}_${avatarFile.name.replace(/&/g, '_')}`;
      const filePath = `avatars/${fileName}`;
      console.log('Путь к файлу:', filePath);
      
      const fileRef = ref(storage, filePath);
      console.log('Создана ссылка на файл в хранилище');
      
      try {
        console.log('Загружаем файл...');
        const uploadResult = await uploadBytes(fileRef, avatarFile);
        console.log('Файл успешно загружен:', uploadResult);
        
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log('Получен URL для скачивания:', downloadURL);
        return downloadURL;
      } catch (uploadError: any) {
        console.error('Ошибка при загрузке файла:', uploadError);
        console.error('Код ошибки:', uploadError.code);
        console.error('Сообщение ошибки:', uploadError.message);
        
        if (uploadError.message && uploadError.message.includes('CORS')) {
          setAlert({
            open: true,
            message: 'Ошибка CORS при загрузке аватара. Пожалуйста, сообщите администратору о необходимости настройки CORS для Firebase Storage.',
            severity: 'error',
          });
        } else {
          setAlert({
            open: true,
            message: `Не удалось загрузить аватар: ${uploadError.message || 'Неизвестная ошибка'}`,
            severity: 'error',
          });
        }
        return null;
      }
    } catch (error) {
      console.error('Общая ошибка при загрузке аватара:', error);
      setAlert({
        open: true,
        message: 'Не удалось загрузить аватар',
        severity: 'error',
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      let updatedData = { ...formData };
      
      // Если есть новый аватар, загружаем его
      if (avatarFile) {
        const photoURL = await uploadAvatar();
        if (photoURL) {
          updatedData.photoURL = photoURL;
        }
      }
      
      // Устанавливаем дату обновления
      updatedData.updatedAt = new Date();
      
      await updateUserProfile(profile.id, updatedData);
      await onProfileUpdated();
      
      setAlert({
        open: true,
        message: 'Профиль успешно обновлен',
        severity: 'success',
      });
      
      // Закрываем диалог после успешного обновления
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setAlert({
        open: true,
        message: 'Не удалось обновить профиль',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Редактировать профиль</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <StyledAvatar 
              src={avatarPreview || formData.photoURL} 
              alt={formData.displayName || 'Пользователь'} 
            />
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              size="small"
              sx={{ borderRadius: 20, mt: 1 }}
            >
              Изменить фото
              <VisuallyHiddenInput type="file" accept="image/*" onChange={handleAvatarChange} />
            </Button>
          </Box>
          
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            </Stack>
            
            <Box>
              <TextField
                fullWidth
                label="О себе"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Город"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Страна"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            </Stack>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  margin="normal"
                  type="email"
                />
              </Box>
            </Stack>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="language-label">Язык</InputLabel>
                  <Select
                    labelId="language-label"
                    name="language"
                    value={formData.language || ''}
                    label="Язык"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Русский">Русский</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Español">Español</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="preferences-theme-label">Тема оформления</InputLabel>
                  <Select
                    labelId="preferences-theme-label"
                    name="preferences.theme"
                    value={(formData.preferences?.theme) || 'system'}
                    label="Тема оформления"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="light">Светлая</MenuItem>
                    <MenuItem value="dark">Темная</MenuItem>
                    <MenuItem value="system">Системная</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Уведомления</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.notifications?.email}
                      onChange={handleSwitchChange('notifications.email')}
                    />
                  }
                  label="Email уведомления"
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.notifications?.telegram}
                      onChange={handleSwitchChange('notifications.telegram')}
                    />
                  }
                  label="Telegram уведомления"
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.notifications?.sms}
                      onChange={handleSwitchChange('notifications.sms')}
                    />
                  }
                  label="SMS уведомления"
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProfileForm; 