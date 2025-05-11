import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  styled
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { Save, Check, Close, LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { AppSettings } from '../types';
import { useNavigate } from 'react-router-dom';

// Styled components
const SettingsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SettingsCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(3),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ColorContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const ColorPickerContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ColorPreview = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: '100%',
  height: 40,
  borderRadius: theme.spacing(1),
  backgroundColor: color,
  marginTop: theme.spacing(1),
  border: '1px solid rgba(0,0,0,0.1)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 100,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
}));

const AccessDeniedContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

const LockIcon = styled(LockOutlined)(({ theme }) => ({
  fontSize: 72,
  color: theme.palette.text.secondary,
  opacity: 0.5,
  marginBottom: theme.spacing(3),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <TabPanel>{children}</TabPanel>
      )}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { appSettings, updateSettings, isAdmin } = useFirebase();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    appName: '',
    logoUrl: '',
    heroImageUrl: '', 
    primaryColor: '#1976D2', 
    secondaryColor: '#9C27B0',
    contactEmail: '',
    contactPhone: '',
  });

  // Загружаем текущие настройки
  useEffect(() => {
    if (appSettings) {
      setSettings({
        appName: appSettings.appName || '',
        logoUrl: appSettings.logoUrl || '',
        heroImageUrl: appSettings.heroImageUrl || '',
        primaryColor: appSettings.primaryColor || '#1976D2',
        secondaryColor: appSettings.secondaryColor || '#9C27B0',
        contactEmail: appSettings.contactEmail || '',
        contactPhone: appSettings.contactPhone || '',
      });
    }
  }, [appSettings]);

  // Перенаправление обычных пользователей
  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string, type: 'primary' | 'secondary') => {
    setSettings(prev => ({
      ...prev,
      [type === 'primary' ? 'primaryColor' : 'secondaryColor']: color
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await updateSettings(settings);
      
      if (success) {
        setSuccess(true);
      } else {
        setError('Не удалось сохранить настройки');
      }
    } catch (err) {
      setError('Произошла ошибка при сохранении настроек');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Отображение экрана ограниченного доступа для обычных пользователей
  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SettingsContainer>
          <AccessDeniedContainer>
            <LockIcon />
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Доступ ограничен
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
              Настройки приложения доступны только администраторам. 
              Вы будете перенаправлены на главную страницу через несколько секунд.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/')}
            >
              Вернуться на главную
            </Button>
          </AccessDeniedContainer>
        </SettingsContainer>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SettingsContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Настройки приложения
          </Typography>
          
          <SaveButton
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={loading}
          >
            Сохранить
          </SaveButton>
        </Box>
        
        <SettingsCard>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 56,
              }
            }}
          >
            <Tab label="Основные" />
            <Tab label="Карточки розыгрышей" />
            <Tab label="Кошелек Telegram" />
          </Tabs>
          
          <CustomTabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              label="Название приложения"
              name="appName"
              value={settings.appName}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="URL логотипа"
              name="logoUrl"
              value={settings.logoUrl}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              helperText="URL изображения логотипа, которое будет отображаться в шапке"
            />
            
            <TextField
              fullWidth
              label="URL изображения героя"
              name="heroImageUrl"
              value={settings.heroImageUrl}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              helperText="URL изображения для главного баннера на домашней странице"
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
              Цвета и контакты
            </Typography>
            
            <ColorContainer>
              <Typography variant="subtitle1" fontWeight={500}>
                Основной цвет
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                margin="normal"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value, 'primary')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '4px', 
                          bgcolor: settings.primaryColor,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
              />
              
              <ColorPickerContainer>
                <HexColorPicker 
                  color={settings.primaryColor} 
                  onChange={(color) => handleColorChange(color, 'primary')} 
                  style={{ width: '100%' }}
                />
              </ColorPickerContainer>
            </ColorContainer>
            
            <ColorContainer>
              <Typography variant="subtitle1" fontWeight={500}>
                Вторичный цвет
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                margin="normal"
                value={settings.secondaryColor}
                onChange={(e) => handleColorChange(e.target.value, 'secondary')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '4px', 
                          bgcolor: settings.secondaryColor,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
              />
              
              <ColorPickerContainer>
                <HexColorPicker 
                  color={settings.secondaryColor} 
                  onChange={(color) => handleColorChange(color, 'secondary')} 
                  style={{ width: '100%' }}
                />
              </ColorPickerContainer>
            </ColorContainer>
            
            <TextField
              fullWidth
              label="Контактный Email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Контактный телефон"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
          </CustomTabPanel>
          
          <CustomTabPanel value={tabValue} index={1}>
            <Typography variant="body1">
              Настройки карточек розыгрышей появятся здесь в будущих обновлениях.
            </Typography>
          </CustomTabPanel>
          
          <CustomTabPanel value={tabValue} index={2}>
            <Typography variant="body1">
              Настройки кошелька Telegram появятся здесь в будущих обновлениях.
            </Typography>
          </CustomTabPanel>
        </SettingsCard>
      </SettingsContainer>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
          icon={<Check />}
        >
          Настройки успешно сохранены
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          variant="filled"
          icon={<Close />}
        >
          {error}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default SettingsPage; 