import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  BuildCircle,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { runMigrations } from '../../firebase/migrations';

interface MigrationResult {
  success: boolean;
  message: string;
}

const DatabaseMigration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  
  const handleRunMigration = async () => {
    if (window.confirm('Вы уверены, что хотите запустить миграцию базы данных? Этот процесс обновит структуру данных.')) {
      try {
        setLoading(true);
        setResult(null);
        
        const success = await runMigrations();
        
        setResult({
          success,
          message: success 
            ? 'Миграция успешно выполнена! Структура базы данных обновлена.' 
            : 'Ошибка при выполнении миграции. Проверьте консоль для деталей.'
        });
      } catch (error: unknown) {
        console.error('Ошибка миграции:', error);
        let errorMessage = 'Неизвестная ошибка';
        
        if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String(error.message);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        setResult({
          success: false,
          message: `Ошибка при выполнении миграции: ${errorMessage}`
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <BuildCircle color="primary" sx={{ mr: 1.5 }} />
        <Typography variant="h5" component="h2">
          Миграция базы данных
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="body1" paragraph>
        Эта функция обновит структуру базы данных для поддержки всех новых возможностей админ-панели:
      </Typography>
      
      <Box component="ul" sx={{ mb: 3 }}>
        <Typography component="li">
          Добавит поддержку спецификаций автомобилей в розыгрыши
        </Typography>
        <Typography component="li">
          Создаст коллекцию особенностей автомобилей с базовыми значениями
        </Typography>
        <Typography component="li">
          Обновит структуру компаний для поддержки расширенной информации
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        <strong>Примечание:</strong> Миграция безопасна и сохранит все существующие данные, 
        просто добавив новые поля, где это необходимо. Тем не менее, рекомендуется сделать резервную копию 
        перед запуском миграции.
      </Typography>
      
      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'}
          sx={{ mb: 3 }}
          icon={result.success ? <CheckCircle /> : <Error />}
        >
          <AlertTitle>{result.success ? 'Успех' : 'Ошибка'}</AlertTitle>
          {result.message}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={loading}
          onClick={handleRunMigration}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
        >
          {loading ? 'Выполняется миграция...' : 'Запустить миграцию'}
        </Button>
      </Box>
    </Paper>
  );
};

export default DatabaseMigration; 