import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline, alpha } from '@mui/material';
import { useFirebase } from './FirebaseContext';

// Типы темы
type ThemeMode = 'light' | 'dark';

// Контекст
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Создаем контекст
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

// Хук для использования контекста темы
export const useThemeContext = () => useContext(ThemeContext);

// Свойства провайдера темы
interface ThemeProviderProps {
  children: React.ReactNode;
}

// ThemeProvider обертка для доступа к Firebase данным
export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Создаем FirebaseContext stub для избежания циклической зависимости
  const firebaseStub = {
    appSettings: {
      primaryColor: localStorage.getItem('primaryColor') || '#2196F3',
      secondaryColor: localStorage.getItem('secondaryColor') || '#9C27B0'
    },
    companies: [],
    raffles: [],
    activeCompany: null,
    carFeatures: [],
    loading: false,
    error: null,
    setActiveCompany: () => {},
    refreshData: async () => {},
    addCompany: async () => ({ id: '' }),
    editCompany: async () => false,
    removeCompany: async () => false,
    addRaffle: async () => ({ id: '' }),
    editRaffle: async () => false,
    removeRaffle: async () => false,
    updateCarSpecs: async () => false,
    updateSettings: async (settings: { primaryColor?: string; secondaryColor?: string; [key: string]: any }) => {
      if (settings.primaryColor) localStorage.setItem('primaryColor', settings.primaryColor);
      if (settings.secondaryColor) localStorage.setItem('secondaryColor', settings.secondaryColor);
      return true;
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      mode: localStorage.getItem('themeMode') as ThemeMode || 'light',
      toggleTheme: () => {},
      setMode: () => {}
    }}>
      <InnerThemeProvider firebaseData={firebaseStub}>
        {children}
      </InnerThemeProvider>
    </ThemeContext.Provider>
  );
};

// Внутренний провайдер темы, принимающий данные Firebase напрямую
interface InnerThemeProviderProps extends ThemeProviderProps {
  firebaseData: any;
}

const InnerThemeProvider: React.FC<InnerThemeProviderProps> = ({ children, firebaseData }) => {
  // Проверяем сохраненную тему или системные настройки
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
  
  // Применяем настройки из Firebase
  const appSettings = firebaseData.appSettings;
  
  // Устанавливаем начальное значение
  const [mode, setMode] = useState<ThemeMode>(savedMode || (prefersDarkMode ? 'dark' : 'light'));
  
  // Переключатель темы
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  // Устанавливаем конкретный режим
  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };
  
  // Сохраняем выбранную тему
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Устанавливаем цвет темы для мобильного браузера (для Telegram Mini App)
    if (mode === 'dark') {
      document.documentElement.style.setProperty('--tg-theme-bg-color', '#121212');
      document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-hint-color', '#8c8c8c');
      document.documentElement.style.setProperty('--tg-theme-button-color', appSettings?.primaryColor || '#1976D2');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
    } else {
      document.documentElement.style.setProperty('--tg-theme-bg-color', '#f5f7fa');
      document.documentElement.style.setProperty('--tg-theme-text-color', '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', '#5f6368');
      document.documentElement.style.setProperty('--tg-theme-button-color', appSettings?.primaryColor || '#2196F3');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
    }
  }, [mode, appSettings]);
  
  // Создаем тему на основе выбранного режима
  const theme = useMemo(() => {
    let baseTheme = createTheme({
      palette: {
        mode,
        primary: {
          main: appSettings?.primaryColor || '#2196F3', // Используем цвет из настроек или основной синий
          light: '#64B5F6',
          dark: '#1976D2',
          contrastText: '#fff',
        },
        secondary: {
          main: appSettings?.secondaryColor || '#9C27B0', // Используем цвет из настроек или фиолетовый
          light: '#BA68C8',
          dark: '#7B1FA2',
          contrastText: '#fff',
        },
        error: {
          main: '#F44336',
          light: '#E57373',
          dark: '#D32F2F',
        },
        warning: {
          main: '#FF9800',
          light: '#FFB74D',
          dark: '#F57C00',
        },
        info: {
          main: '#03A9F4',
          light: '#4FC3F7',
          dark: '#0288D1',
        },
        success: {
          main: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
        },
        background: {
          default: mode === 'light' ? '#f5f7fa' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? '#212121' : '#f5f5f5',
          secondary: mode === 'light' ? '#5f6368' : '#b0b0b0',
        },
        divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
        fontSize: 14,
        h1: {
          fontWeight: 800,
          fontSize: '2.8rem',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        },
        h2: {
          fontWeight: 800,
          fontSize: '2.4rem',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        },
        h3: {
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.6rem',
          lineHeight: 1.25,
        },
        h5: {
          fontWeight: 700,
          fontSize: '1.25rem',
          lineHeight: 1.3,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1.1rem',
          lineHeight: 1.3,
        },
        subtitle1: {
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        subtitle2: {
          fontWeight: 600,
          fontSize: '0.9rem',
          lineHeight: 1.5,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.4,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: [
        'none',
        '0 2px 4px rgba(0,0,0,0.05)', 
        '0 4px 8px rgba(0,0,0,0.08)',
        '0 6px 12px rgba(0,0,0,0.1)',
        '0 8px 16px rgba(0,0,0,0.12)',
        '0 10px 20px rgba(0,0,0,0.14)',
        '0 12px 24px rgba(0,0,0,0.15)',
        '0 14px 28px rgba(0,0,0,0.16)',
        '0 16px 32px rgba(0,0,0,0.18)',
        '0 18px 36px rgba(0,0,0,0.2)',
        '0 20px 40px rgba(0,0,0,0.22)',
        '0 22px 44px rgba(0,0,0,0.24)',
        '0 24px 48px rgba(0,0,0,0.26)',
        '0 26px 52px rgba(0,0,0,0.28)',
        '0 28px 56px rgba(0,0,0,0.3)',
        '0 30px 60px rgba(0,0,0,0.32)',
        '0 32px 64px rgba(0,0,0,0.34)',
        '0 34px 68px rgba(0,0,0,0.36)',
        '0 36px 72px rgba(0,0,0,0.38)',
        '0 38px 76px rgba(0,0,0,0.4)',
        '0 40px 80px rgba(0,0,0,0.42)',
        '0 42px 84px rgba(0,0,0,0.44)',
        '0 44px 88px rgba(0,0,0,0.46)',
        '0 46px 92px rgba(0,0,0,0.48)',
        '0 48px 96px rgba(0,0,0,0.5)'
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: mode === 'light' 
                ? '#dadada transparent' 
                : '#3a3a3a transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'light' ? '#dadada' : '#3a3a3a',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: mode === 'light' ? '#b0b0b0' : '#555555',
              },
            },
            // Оптимизация для Telegram Mini App
            '.tg-app': {
              background: 'var(--tg-theme-bg-color, #f5f7fa)',
              color: 'var(--tg-theme-text-color, #000000)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              textTransform: 'none',
              borderRadius: 12,
              fontWeight: 600,
              padding: '8px 16px',
              transition: 'all 0.25s ease',
              '&:hover': {
                boxShadow: mode === 'light' 
                  ? '0px 4px 8px rgba(0, 0, 0, 0.08)' 
                  : '0px 4px 8px rgba(255, 255, 255, 0.08)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            },
            contained: {
              boxShadow: mode === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                : '0 4px 12px rgba(0, 0, 0, 0.25)',
            },
            containedPrimary: {
              background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
            },
            containedSecondary: {
              background: 'linear-gradient(90deg, #9C27B0 0%, #7B1FA2 100%)',
            },
            outlined: {
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
              },
            },
            outlinedPrimary: {
              borderColor: alpha('#2196F3', 0.5),
              '&:hover': {
                borderColor: '#2196F3',
                backgroundColor: alpha('#2196F3', 0.08),
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: mode === 'light' 
                ? '0px 8px 24px rgba(0, 0, 0, 0.08)' 
                : '0px 8px 24px rgba(0, 0, 0, 0.25)',
              transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
              '&:hover': {
                boxShadow: mode === 'light' 
                  ? '0px 12px 32px rgba(0, 0, 0, 0.12)' 
                  : '0px 12px 32px rgba(0, 0, 0, 0.35)',
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'light' 
                ? '0px 2px 10px rgba(0, 0, 0, 0.05)' 
                : '0px 2px 10px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              backgroundColor: mode === 'light' 
                ? alpha('#ffffff', 0.9) 
                : alpha('#1e1e1e', 0.9),
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                '& fieldset': {
                  borderWidth: 1.5,
                  borderColor: mode === 'light'
                    ? alpha('#000000', 0.15)
                    : alpha('#ffffff', 0.15),
                },
                '&:hover fieldset': {
                  borderColor: mode === 'light'
                    ? alpha('#000000', 0.3)
                    : alpha('#ffffff', 0.3),
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                },
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: mode === 'light' 
                ? '0 2px 8px rgba(0, 0, 0, 0.06)' 
                : '0 2px 8px rgba(0, 0, 0, 0.2)',
            },
            elevation2: {
              boxShadow: mode === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                : '0 4px 12px rgba(0, 0, 0, 0.25)',
            },
            elevation3: {
              boxShadow: mode === 'light' 
                ? '0 6px 16px rgba(0, 0, 0, 0.1)' 
                : '0 6px 16px rgba(0, 0, 0, 0.3)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 500,
              transition: 'all 0.2s ease',
            },
            filled: {
              boxShadow: mode === 'light' 
                ? '0 2px 6px rgba(0, 0, 0, 0.08)' 
                : '0 2px 6px rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundImage: 'none',
              boxShadow: mode === 'light' 
                ? '0 8px 24px rgba(0, 0, 0, 0.1)' 
                : '0 8px 24px rgba(0, 0, 0, 0.3)',
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              '&.Mui-selected': {
                backgroundColor: alpha('#2196F3', 0.08),
                '&:hover': {
                  backgroundColor: alpha('#2196F3', 0.12),
                },
              },
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              height: 6,
              backgroundColor: mode === 'light' 
                ? 'rgba(0, 0, 0, 0.08)'
                : 'rgba(255, 255, 255, 0.08)',
            },
            bar: {
              borderRadius: 8,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? alpha('#000000', 0.04)
                  : alpha('#ffffff', 0.04),
              }
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: 3,
              borderRadius: 3,
            },
          },
        },
      },
    });
    
    // Делаем шрифты адаптивными
    return responsiveFontSizes(baseTheme);
  }, [mode, appSettings]);
  
  const contextValue = {
    mode,
    toggleTheme,
    setMode: handleSetMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 