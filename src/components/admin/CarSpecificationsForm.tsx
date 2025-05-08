import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Delete } from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Raffle, CarSpecifications, CarEngine, CarDimensions } from '../../types';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const FormSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  margin: theme.spacing(0, -1),
}));

const FormField = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  marginBottom: theme.spacing(2),
  boxSizing: 'border-box',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '50%',
  },
}));

interface CarSpecificationsFormProps {
  raffle?: Raffle;
  raffleId?: string;
  onCancel?: () => void;
  onSaved?: () => void;
}

const DEFAULT_CAR_SPECS: CarSpecifications = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  engine: {
    type: '',
    displacement: '',
    horsepower: 0,
    torque: ''
  },
  transmission: '',
  drivetrain: '',
  acceleration: '',
  topSpeed: '',
  power: '',
  fuel: '',
  features: [],
  exteriorColor: '',
  interiorColor: '',
  dimensions: {
    length: '',
    width: '',
    height: '',
    wheelbase: ''
  },
  weight: '',
  fuelEconomy: ''
};

const CarSpecificationsForm: React.FC<CarSpecificationsFormProps> = ({ raffle, raffleId, onCancel, onSaved }) => {
  const [loadedRaffle, setLoadedRaffle] = useState<Raffle | null>(raffle || null);
  const [carSpecs, setCarSpecs] = useState<CarSpecifications>(
    raffle?.carSpecifications || DEFAULT_CAR_SPECS
  );
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!raffleId && !raffle);
  const [success, setSuccess] = useState(false);

  // Загрузка розыгрыша по ID, если передан raffleId
  useEffect(() => {
    const loadRaffleById = async () => {
      if (raffleId && !raffle) {
        setInitialLoading(true);
        try {
          const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
          if (raffleDoc.exists()) {
            const raffleData = { id: raffleDoc.id, ...raffleDoc.data() } as Raffle;
            setLoadedRaffle(raffleData);
            setCarSpecs(raffleData.carSpecifications || DEFAULT_CAR_SPECS);
          }
        } catch (error) {
          console.error('Error loading raffle:', error);
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadRaffleById();
  }, [raffleId, raffle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCarSpecs(prev => ({ ...prev, [name]: value }));
  };

  const handleEngineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCarSpecs(prev => ({
      ...prev,
      engine: {
        ...prev.engine,
        [name]: name === 'horsepower' ? Number(value) : value
      }
    }));
  };

  const handleDimensionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCarSpecs(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value
      }
    }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCarSpecs(prev => ({ ...prev, year: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setCarSpecs(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setCarSpecs(prev => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = async () => {
    const currentRaffle = loadedRaffle || raffle;
    if (!currentRaffle?.id) return;
    
    try {
      setLoading(true);
      const raffleRef = doc(db, 'raffles', currentRaffle.id);
      await updateDoc(raffleRef, {
        carSpecifications: carSpecs
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else if (onCancel) {
          onCancel();
        }
      }, 1500);
    } catch (error) {
      console.error('Error updating car specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <FormContainer>
        <Typography variant="h6" gutterBottom>
          Характеристики автомобиля
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <FormSection>
          <FormField>
            <TextField
              fullWidth
              label="Марка"
              name="make"
              value={carSpecs.make}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Модель"
              name="model"
              value={carSpecs.model}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Год выпуска"
              name="year"
              type="number"
              value={carSpecs.year}
              onChange={handleYearChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Мощность (например, '625 л.с.')"
              name="power"
              value={carSpecs.power}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
        </FormSection>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Двигатель
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <FormSection>
          <FormField>
            <TextField
              fullWidth
              label="Тип двигателя"
              name="type"
              value={carSpecs.engine.type}
              onChange={handleEngineChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Объем"
              name="displacement"
              value={carSpecs.engine.displacement}
              onChange={handleEngineChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Лошадиные силы"
              name="horsepower"
              type="number"
              value={carSpecs.engine.horsepower}
              onChange={handleEngineChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Крутящий момент"
              name="torque"
              value={carSpecs.engine.torque}
              onChange={handleEngineChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
        </FormSection>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Динамика и характеристики
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <FormSection>
          <FormField>
            <TextField
              fullWidth
              label="Трансмиссия"
              name="transmission"
              value={carSpecs.transmission}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Привод"
              name="drivetrain"
              value={carSpecs.drivetrain}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Разгон до 100 км/ч"
              name="acceleration"
              value={carSpecs.acceleration}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Максимальная скорость"
              name="topSpeed"
              value={carSpecs.topSpeed}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Тип топлива"
              name="fuel"
              value={carSpecs.fuel}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Расход топлива"
              name="fuelEconomy"
              value={carSpecs.fuelEconomy}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
        </FormSection>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Цвет и габариты
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <FormSection>
          <FormField>
            <TextField
              fullWidth
              label="Цвет кузова"
              name="exteriorColor"
              value={carSpecs.exteriorColor}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Цвет салона"
              name="interiorColor"
              value={carSpecs.interiorColor}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Вес"
              name="weight"
              value={carSpecs.weight}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
        </FormSection>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Размеры
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <FormSection>
          <FormField>
            <TextField
              fullWidth
              label="Длина"
              name="length"
              value={carSpecs.dimensions.length}
              onChange={handleDimensionsChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Ширина"
              name="width"
              value={carSpecs.dimensions.width}
              onChange={handleDimensionsChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Высота"
              name="height"
              value={carSpecs.dimensions.height}
              onChange={handleDimensionsChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
          <FormField>
            <TextField
              fullWidth
              label="Колесная база"
              name="wheelbase"
              value={carSpecs.dimensions.wheelbase}
              onChange={handleDimensionsChange}
              variant="outlined"
              margin="normal"
            />
          </FormField>
        </FormSection>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Особенности и комплектация
        </Typography>
        <Divider sx={{ mb: 3, mt: 1 }} />

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Добавить особенность"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddFeature}
              sx={{ height: 56 }}
            >
              Добавить
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {carSpecs.features.map((feature, index) => (
            <FeatureChip
              key={index}
              label={feature}
              onDelete={() => handleRemoveFeature(index)}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel} 
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : success ? 'Сохранено!' : 'Сохранить'}
          </Button>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default CarSpecificationsForm; 