import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Check,
  AssignmentInd
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  getRaffle, 
  getRaffleWinners, 
  addRaffleWinner, 
  updateWinner, 
  deleteWinner 
} from '../../firebase/services';
import { Winner, Raffle, PrizePlace } from '../../types';
import { formatDate } from '../../utils/formatters';

interface WinnersManagerProps {
  raffleId: string;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const WinnersManager: React.FC<WinnersManagerProps> = ({ raffleId }) => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [form, setForm] = useState({
    userId: '',
    ticketNumber: '',
    place: '',
    prizeTitle: '',
    prizeImage: ''
  });

  // Загрузка данных о розыгрыше и победителях
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Загружаем информацию о розыгрыше
        const raffleData = await getRaffle(raffleId);
        setRaffle(raffleData);

        // Загружаем список победителей
        const winnersData = await getRaffleWinners(raffleId);
        setWinners(winnersData as Winner[]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные о победителях');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [raffleId]);

  // Открытие диалога для создания или редактирования победителя
  const handleOpenDialog = (winner?: Winner) => {
    if (winner) {
      setEditingWinner(winner);
      setForm({
        userId: winner.userId,
        ticketNumber: winner.ticketNumber.toString(),
        place: winner.place ? winner.place.toString() : '',
        prizeTitle: winner.prizeTitle || '',
        prizeImage: winner.prizeImage || ''
      });
    } else {
      setEditingWinner(null);
      setForm({
        userId: '',
        ticketNumber: '',
        place: '',
        prizeTitle: '',
        prizeImage: ''
      });
    }
    setOpenDialog(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWinner(null);
    setError(null);
  };

  // Изменение полей формы
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name as string]: value
    });

    // Если это изменение места и есть мульти-розыгрыш и призовые места
    if (name === 'place' && raffle?.isMultiPrize && raffle.prizePlaces && raffle.prizePlaces.length > 0) {
      const place = parseInt(value as string);
      const prizePlace = raffle.prizePlaces.find(p => p.place === place);
      
      if (prizePlace) {
        setForm(prevForm => ({
          ...prevForm,
          prizeTitle: prizePlace.prizeTitle || `Приз за ${place} место`,
          prizeImage: prizePlace.prizeImage || ''
        }));
      }
    }
  };

  // Сохранение победителя
  const handleSaveWinner = async () => {
    setError(null);
    setSuccess(null);

    // Валидация данных
    if (!form.userId.trim()) {
      setError('Необходимо указать ID пользователя');
      return;
    }

    if (!form.ticketNumber.trim() || isNaN(parseInt(form.ticketNumber))) {
      setError('Необходимо указать корректный номер билета');
      return;
    }

    try {
      const winnerData = {
        raffleId,
        userId: form.userId,
        ticketNumber: parseInt(form.ticketNumber),
        winDate: new Date(),
        ...(form.place && { place: parseInt(form.place) }),
        ...(form.prizeTitle && { prizeTitle: form.prizeTitle }),
        ...(form.prizeImage && { prizeImage: form.prizeImage })
      };

      if (editingWinner) {
        // Обновление существующего победителя
        await updateWinner(editingWinner.id, winnerData);
        setSuccess('Победитель успешно обновлен');
      } else {
        // Создание нового победителя
        await addRaffleWinner(winnerData);
        setSuccess('Победитель успешно добавлен');
      }

      // Перезагрузка списка победителей
      const updatedWinners = await getRaffleWinners(raffleId);
      setWinners(updatedWinners as Winner[]);
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении победителя:', error);
      setError('Произошла ошибка при сохранении данных');
    }
  };

  // Удаление победителя
  const handleDeleteWinner = async (winnerId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого победителя?')) {
      setError(null);
      setSuccess(null);

      try {
        await deleteWinner(winnerId);
        setSuccess('Победитель успешно удален');

        // Перезагрузка списка победителей
        const updatedWinners = await getRaffleWinners(raffleId);
        setWinners(updatedWinners as Winner[]);
      } catch (error) {
        console.error('Ошибка при удалении победителя:', error);
        setError('Произошла ошибка при удалении победителя');
      }
    }
  };

  // Получение названия приза по месту
  const getPrizeTitle = (place: number): string => {
    if (!raffle?.isMultiPrize || !raffle.prizePlaces) {
      return '';
    }

    const prizePlace = raffle.prizePlaces.find(p => p.place === place);
    return prizePlace ? prizePlace.prizeTitle : '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление победителями</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Добавить победителя
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : winners.length > 0 ? (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Победителя</TableCell>
                <TableCell>ID Пользователя</TableCell>
                <TableCell>Номер билета</TableCell>
                <TableCell>Место</TableCell>
                <TableCell>Приз</TableCell>
                <TableCell>Дата выигрыша</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {winners.map(winner => (
                <TableRow key={winner.id}>
                  <TableCell>{winner.id}</TableCell>
                  <TableCell>{winner.userId}</TableCell>
                  <TableCell>{winner.ticketNumber}</TableCell>
                  <TableCell>{winner.place || '-'}</TableCell>
                  <TableCell>{winner.prizeTitle || getPrizeTitle(winner.place || 1) || '-'}</TableCell>
                  <TableCell>{formatDate(winner.winDate)}</TableCell>
                  <TableCell>
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(winner)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteWinner(winner.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Пока нет победителей для этого розыгрыша
          </Typography>
        </Paper>
      )}

      {/* Диалог добавления/редактирования победителя */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWinner ? 'Редактировать победителя' : 'Добавить победителя'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ID пользователя"
              name="userId"
              value={form.userId}
              onChange={handleFormChange}
              fullWidth
              required
            />

            <TextField
              label="Номер билета"
              name="ticketNumber"
              type="number"
              value={form.ticketNumber}
              onChange={handleFormChange}
              fullWidth
              required
            />

            {raffle?.isMultiPrize && raffle.prizePlaces && raffle.prizePlaces.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Призовое место</InputLabel>
                <Select
                  name="place"
                  value={form.place}
                  onChange={handleFormChange as any}
                  label="Призовое место"
                >
                  <MenuItem value="">
                    <em>Не указано</em>
                  </MenuItem>
                  {raffle.prizePlaces.map(place => (
                    <MenuItem key={place.place} value={place.place.toString()}>
                      {place.place} место - {place.prizeTitle || `Приз ${place.place} места`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Название приза"
              name="prizeTitle"
              value={form.prizeTitle}
              onChange={handleFormChange}
              fullWidth
            />

            <TextField
              label="Изображение приза (URL)"
              name="prizeImage"
              value={form.prizeImage}
              onChange={handleFormChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button
            onClick={handleSaveWinner}
            variant="contained"
            color="primary"
            startIcon={<Check />}
          >
            {editingWinner ? 'Обновить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WinnersManager; 