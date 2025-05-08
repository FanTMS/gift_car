import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import SuperAdminAssigner from '../../components/admin/SuperAdminAssigner';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../context/FirebaseContext';

const SuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useFirebase();
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  
  // Обработчик успешного назначения
  const handleSuccess = () => {
    setAssignmentSuccess(true);
    
    // Переход на главную страницу после успешного назначения
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  // Обработчик ошибки назначения
  const handleError = (error: string) => {
    console.error('Ошибка назначения суперадминистратора:', error);
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Настройка прав администратора
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, my: 3 }}>
          <Typography variant="h5" gutterBottom>
            Управление правами
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <SuperAdminAssigner 
            onSuccess={handleSuccess} 
            onError={handleError} 
          />
          
          {assignmentSuccess && (
            <Box sx={{ mt: 3 }}>
              <Typography>
                Успешно! Перенаправление на главную страницу...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SuperAdminPage; 