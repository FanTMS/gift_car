import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Link
} from '@mui/material';
import {
  Save,
  Image,
  ColorLens,
  Visibility,
  Email,
  Phone,
  Title,
  ViewModule,
  Favorite,
  Badge,
  Money,
  Telegram,
  AccountBalanceWallet,
  Info
} from '@mui/icons-material';
import { useFirebase } from '../../context/FirebaseContext';
import { AppSettings } from '../../types';
import ColorPicker from '../ColorPicker';

const initialSettings: Partial<AppSettings> = {
  appName: '',
  logoUrl: '',
  heroImageUrl: '',
  primaryColor: '#1976D2',
  secondaryColor: '#2196F3',
  contactEmail: '',
  contactPhone: '',
  cardSettings: {
    enableFavorites: true,
    showCompanyLogo: true,
    showPrice: true,
    showProgress: true,
    cornerRadius: '20px',
    enableHoverEffects: true,
    cardElevation: 'medium'
  },
  telegramWallet: {
    enabled: false,
    botToken: '',
    botUsername: '',
    callbackUrl: '',
    welcomeMessage: 'Добро пожаловать в кошелек Telegram!'
  }
};

// Компонент для отображения вкладок настроек
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AppSettingsForm: React.FC = () => {
  const { appSettings, updateSettings } = useFirebase();
  const [settings, setSettings] = useState<Partial<AppSettings>>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    if (appSettings) {
      setSettings({
        appName: appSettings.appName || '',
        logoUrl: appSettings.logoUrl || '',
        heroImageUrl: appSettings.heroImageUrl || '',
        primaryColor: appSettings.primaryColor || '#1976D2',
        secondaryColor: appSettings.secondaryColor || '#2196F3',
        contactEmail: appSettings.contactEmail || '',
        contactPhone: appSettings.contactPhone || '',
        cardSettings: {
          enableFavorites: appSettings.cardSettings?.enableFavorites ?? true,
          showCompanyLogo: appSettings.cardSettings?.showCompanyLogo ?? true,
          showPrice: appSettings.cardSettings?.showPrice ?? true,
          showProgress: appSettings.cardSettings?.showProgress ?? true,
          cornerRadius: appSettings.cardSettings?.cornerRadius || '20px',
          enableHoverEffects: appSettings.cardSettings?.enableHoverEffects ?? true,
          cardElevation: appSettings.cardSettings?.cardElevation || 'medium'
        },
        telegramWallet: {
          enabled: appSettings.telegramWallet?.enabled ?? false,
          botToken: appSettings.telegramWallet?.botToken || '',
          botUsername: appSettings.telegramWallet?.botUsername || '',
          callbackUrl: appSettings.telegramWallet?.callbackUrl || '',
          welcomeMessage: appSettings.telegramWallet?.welcomeMessage || 'Добро пожаловать в кошелек Telegram!'
        }
      });
    }
  }, [appSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Функция для типобезопасного обновления настроек карточек
  const updateCardSettings = (
    name: string, 
    value: string | boolean, 
    isCheckbox: boolean,
    prevSettings: Partial<AppSettings>
  ): Partial<AppSettings> => {
    // Получаем текущие настройки карточек или используем дефолтные
    const currentCardSettings = prevSettings.cardSettings || {
      enableFavorites: true,
      showCompanyLogo: true,
      showPrice: true,
      showProgress: true,
      cornerRadius: '20px',
      enableHoverEffects: true,
      cardElevation: 'medium'
    };
    
    // Создаем копию текущих настроек
    const updatedCardSettings = { ...currentCardSettings };
    
    // Обновляем нужное поле на основе имени
    if (name === 'enableFavorites' && isCheckbox) {
      updatedCardSettings.enableFavorites = value as boolean;
    } else if (name === 'showCompanyLogo' && isCheckbox) {
      updatedCardSettings.showCompanyLogo = value as boolean;
    } else if (name === 'showPrice' && isCheckbox) {
      updatedCardSettings.showPrice = value as boolean;
    } else if (name === 'showProgress' && isCheckbox) {
      updatedCardSettings.showProgress = value as boolean;
    } else if (name === 'enableHoverEffects' && isCheckbox) {
      updatedCardSettings.enableHoverEffects = value as boolean;
    } else if (name === 'cornerRadius' && !isCheckbox) {
      updatedCardSettings.cornerRadius = value as string;
    } else if (name === 'cardElevation' && !isCheckbox) {
      updatedCardSettings.cardElevation = value as 'low' | 'medium' | 'high';
    }
    
    // Возвращаем обновленный объект настроек
    return {
      ...prevSettings,
      cardSettings: updatedCardSettings
    };
  };
  
  const handleCardSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const newValue = isCheckbox ? checked : value;
    
    setSettings(prevSettings => 
      updateCardSettings(name, newValue, isCheckbox, prevSettings)
    );
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateSettings(settings);
      
      if (result) {
        setSuccess(true);
      } else {
        setError('Произошла ошибка при сохранении настроек');
      }
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err);
      setError('Произошла ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const previewImage = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  // Функция для обновления настроек кошелька Telegram
  const handleTelegramWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    setSettings(prev => {
      // Получаем текущие настройки кошелька или используем дефолтные
      const currentSettings = prev.telegramWallet || {
        enabled: false,
        botToken: '',
        botUsername: '',
        callbackUrl: '',
        welcomeMessage: 'Добро пожаловать в кошелек Telegram!'
      };
      
      // Создаем обновленные настройки
      const updatedSettings = { ...currentSettings };
      
      // Обновляем нужное поле на основе имени
      if (name === 'enabled' && type === 'checkbox') {
        updatedSettings.enabled = checked;
      } else if (name === 'botToken') {
        updatedSettings.botToken = value;
      } else if (name === 'botUsername') {
        updatedSettings.botUsername = value;
      } else if (name === 'callbackUrl') {
        updatedSettings.callbackUrl = value;
      } else if (name === 'welcomeMessage') {
        updatedSettings.welcomeMessage = value;
      }
      
      // Возвращаем обновленный объект настроек
      return {
        ...prev,
        telegramWallet: updatedSettings
      };
    });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Настройки приложения
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={loading}
        >
          Сохранить
        </Button>
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        aria-label="settings tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Title />} iconPosition="start" label="Основные" />
        <Tab icon={<ViewModule />} iconPosition="start" label="Карточки розыгрышей" />
        <Tab icon={<Telegram />} iconPosition="start" label="Кошелек Telegram" />
      </Tabs>
      
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Основные настройки */}
          <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Основные настройки
            </Typography>
            
            <TextField
              fullWidth
              label="Название приложения"
              name="appName"
              value={settings.appName}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Title />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="URL логотипа"
              name="logoUrl"
              value={settings.logoUrl}
              onChange={handleChange}
              margin="normal"
              helperText="URL изображения логотипа, которое будет отображаться в шапке"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Просмотреть изображение">
                      <IconButton 
                        edge="end" 
                        onClick={() => previewImage(settings.logoUrl || '')}
                        disabled={!settings.logoUrl}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="URL изображения героя"
              name="heroImageUrl"
              value={settings.heroImageUrl}
              onChange={handleChange}
              margin="normal"
              helperText="URL изображения для главного баннера на домашней странице"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Просмотреть изображение">
                      <IconButton 
                        edge="end" 
                        onClick={() => previewImage(settings.heroImageUrl || '')}
                        disabled={!settings.heroImageUrl}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          {/* Цвета и контакты */}
          <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Цвета и контакты
            </Typography>
            
            <ColorPicker
              color={settings.primaryColor || '#1976D2'}
              onChange={(color) => setSettings(prev => ({ ...prev, primaryColor: color }))}
              label="Основной цвет"
            />
            
            <ColorPicker
              color={settings.secondaryColor || '#2196F3'}
              onChange={(color) => setSettings(prev => ({ ...prev, secondaryColor: color }))}
              label="Вторичный цвет"
            />
            
            <TextField
              fullWidth
              label="Контактный Email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              margin="normal"
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Контактный телефон"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom mb={3}>
          Настройки отображения карточек розыгрышей
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: '100%', px: 1.5, mb: 3, flexBasis: { xs: '100%', md: '50%' } }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                Элементы карточки
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardSettings?.enableFavorites}
                    onChange={handleCardSettingChange}
                    name="enableFavorites"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Favorite fontSize="small" sx={{ mr: 1 }} />
                    <Typography>Кнопка "Избранное"</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardSettings?.showCompanyLogo}
                    onChange={handleCardSettingChange}
                    name="showCompanyLogo"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge fontSize="small" sx={{ mr: 1 }} />
                    <Typography>Логотип компании</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardSettings?.showPrice}
                    onChange={handleCardSettingChange}
                    name="showPrice"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Money fontSize="small" sx={{ mr: 1 }} />
                    <Typography>Отображать цену</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardSettings?.showProgress}
                    onChange={handleCardSettingChange}
                    name="showProgress"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ViewModule fontSize="small" sx={{ mr: 1 }} />
                    <Typography>Прогресс-бар</Typography>
                  </Box>
                }
              />
            </Paper>
          </Box>
          
          <Box sx={{ width: '100%', px: 1.5, mb: 3, flexBasis: { xs: '100%', md: '50%' } }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                Внешний вид карточки
              </Typography>
              
              <TextField
                fullWidth
                label="Скругление углов"
                name="cornerRadius"
                value={settings.cardSettings?.cornerRadius}
                onChange={handleCardSettingChange}
                margin="normal"
                helperText="Например: 20px, 12px и т.д."
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardSettings?.enableHoverEffects}
                    onChange={handleCardSettingChange}
                    name="enableHoverEffects"
                  />
                }
                label="Эффекты при наведении"
                sx={{ mt: 2, display: 'block' }}
              />
              
              <TextField
                fullWidth
                label="Тень карточки"
                name="cardElevation"
                select
                SelectProps={{ native: true }}
                value={settings.cardSettings?.cardElevation}
                onChange={handleCardSettingChange}
                margin="normal"
                helperText="Насколько выразительная тень у карточки"
              >
                <option value="low">Слабая</option>
                <option value="medium">Средняя</option>
                <option value="high">Сильная</option>
              </TextField>
            </Paper>
          </Box>
          
          <Box sx={{ width: '100%', px: 1.5 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                Превью карточки с текущими настройками
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Изменения будут применены после сохранения настроек и перезагрузки страницы.
              </Alert>
              
              <Box sx={{ 
                border: '1px dashed rgba(0,0,0,0.1)', 
                borderRadius: 2, 
                p: 2, 
                display: 'flex',
                justifyContent: 'center'
              }}>
                <img 
                  src="/card-preview.png" 
                  alt="Превью карточки"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    maxHeight: 350,
                    borderRadius: 8,
                    opacity: 0.8
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </TabPanel>
      
      {/* Вкладка настроек кошелька Telegram */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom mb={3}>
          Настройки кошелька Telegram
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.telegramWallet?.enabled || false}
                onChange={handleTelegramWalletChange}
                name="enabled"
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWallet fontSize="small" sx={{ mr: 1 }} />
                <Typography>Включить кошелек Telegram</Typography>
              </Box>
            }
          />
        </Box>
        
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="medium" mb={2}>
            Настройки бота
          </Typography>
          
          <TextField
            fullWidth
            label="Токен бота"
            name="botToken"
            value={settings.telegramWallet?.botToken || ''}
            onChange={handleTelegramWalletChange}
            margin="normal"
            type="password"
            helperText="Токен Telegram бота, полученный от @BotFather"
          />
          
          <TextField
            fullWidth
            label="Имя пользователя бота"
            name="botUsername"
            value={settings.telegramWallet?.botUsername || ''}
            onChange={handleTelegramWalletChange}
            margin="normal"
            helperText="Имя пользователя бота без символа @ (например: MyPaymentBot)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  @
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            fullWidth
            label="URL обратного вызова"
            name="callbackUrl"
            value={settings.telegramWallet?.callbackUrl || ''}
            onChange={handleTelegramWalletChange}
            margin="normal"
            helperText="URL для обработки платежных уведомлений от Telegram"
          />
          
          <TextField
            fullWidth
            label="Приветственное сообщение"
            name="welcomeMessage"
            value={settings.telegramWallet?.welcomeMessage || ''}
            onChange={handleTelegramWalletChange}
            margin="normal"
            multiline
            rows={3}
            helperText="Сообщение, которое увидит пользователь при первом подключении кошелька"
          />
        </Paper>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Для настройки кошелька Telegram необходимо создать нового бота через @BotFather и получить токен.
            Подробная инструкция находится в <Link href="https://core.telegram.org/bots/tutorial" target="_blank">официальной документации Telegram</Link>.
          </Typography>
        </Alert>
      </TabPanel>
      
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message="Настройки успешно сохранены"
      />
    </Paper>
  );
};

export default AppSettingsForm; 