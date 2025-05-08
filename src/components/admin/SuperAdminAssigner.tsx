import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { assignBomkooorAsSuperAdmin } from '../../firebase/userServices';

interface SuperAdminAssignerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const SuperAdminAssigner: React.FC<SuperAdminAssignerProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [executed, setExecuted] = useState<boolean>(false);

  // Автоматически запускаем функцию назначения при монтировании компонента
  useEffect(() => {
    const autoAssignSuperAdmin = async () => {
      if (!executed) {
        await handleAssignSuperAdmin();
      }
    };
    
    autoAssignSuperAdmin();
  }, []);

  const handleAssignSuperAdmin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setExecuted(true);
    
    try {
      const result = await assignBomkooorAsSuperAdmin();
      
      if (result) {
        setSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = 'Не удалось назначить пользователя @bomkooor суперадминистратором';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = `Ошибка при назначении пользователя @bomkooor суперадминистратором: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Назначение суперадминистратора
      </Typography>
      
      {loading && (
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Назначение прав суперадминистратора для @bomkooor...</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Пользователь @bomkooor успешно назначен суперадминистратором!
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAssignSuperAdmin}
        disabled={loading || success}
        sx={{ mt: 1 }}
      >
        {success ? 'Выполнено' : 'Назначить @bomkooor суперадминистратором'}
      </Button>
    </Box>
  );
};

export default SuperAdminAssigner; 