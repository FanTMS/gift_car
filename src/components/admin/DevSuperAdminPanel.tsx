import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert, Chip, Paper, alpha, useTheme } from '@mui/material';
import { AdminPanelSettings, SupervisorAccount, Logout, Warning } from '@mui/icons-material';
import { authAsSuperAdmin, isDevSuperAdmin, logoutDevSuperAdmin, getDevSuperAdminUid } from '../../utils/devUtils';
import { motion } from 'framer-motion';

/**
 * Компонент для управления правами суперадминистратора в режиме разработки
 * ВАЖНО: Компонент доступен только в режиме разработки
 */
const DevSuperAdminPanel: React.FC = () => {
  const theme = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Проверяем, активирован ли режим суперадминистратора
  useEffect(() => {
    setIsAdmin(isDevSuperAdmin());
    setAdminUid(getDevSuperAdminUid());
  }, []);
  
  // Функция для авторизации с правами суперадминистратора
  const handleAuthAsSuperAdmin = async () => {
    setLoading(true);
    try {
      await authAsSuperAdmin();
      setIsAdmin(true);
      setAdminUid(getDevSuperAdminUid());
    } catch (error) {
      console.error('Error authorizing as super admin:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для выхода из режима суперадминистратора
  const handleLogout = () => {
    logoutDevSuperAdmin();
    setIsAdmin(false);
    setAdminUid(null);
  };
  
  // Проверяем, что мы в режиме разработки
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Warning color="warning" sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600} color="warning.main">
            Режим разработки
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Этот компонент доступен только в режиме разработки и не будет виден пользователям в production.
          </Typography>
        </Alert>
        
        {isAdmin ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SupervisorAccount color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} color="success.main">
                Режим суперадминистратора активирован
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                UID пользователя:
              </Typography>
              <Chip 
                label={adminUid} 
                variant="outlined" 
                color="primary" 
                sx={{ fontFamily: 'monospace' }} 
              />
            </Box>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Выйти из режима суперадминистратора
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Включите режим суперадминистратора для доступа ко всем функциям админ-панели в режиме разработки.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AdminPanelSettings />}
              onClick={handleAuthAsSuperAdmin}
              disabled={loading}
            >
              {loading ? 'Активация...' : 'Активировать права суперадминистратора'}
            </Button>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default DevSuperAdminPanel; 