import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  InputAdornment,
  Stack,
  Alert
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useFirebase } from '../../context/FirebaseContext';
import { Company } from '../../types';

interface CompanyFormProps {
  company?: Company;
  onCancel: () => void;
  onSaved: () => void;
}

interface FormValues {
  name: string;
  description: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  color: string;
  isMain: boolean;
}

interface FormErrors {
  name?: string;
  logo?: string;
  email?: string;
  website?: string;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onCancel, onSaved }) => {
  const { addCompany, editCompany } = useFirebase();
  
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    description: '',
    logo: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    color: '#0066cc',
    isMain: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [checkingLogo, setCheckingLogo] = useState(false);
  
  useEffect(() => {
    if (company) {
      setFormValues({
        name: company.name || '',
        description: company.description || '',
        logo: company.logo || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        color: company.color || '#0066cc',
        isMain: company.isMain || false
      });
      
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    }
  }, [company]);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Название компании обязательно';
    }
    
    if (!formValues.logo.trim()) {
      newErrors.logo = 'URL логотипа обязателен';
    } else if (!/^https?:\/\/.+/.test(formValues.logo)) {
      newErrors.logo = 'URL должен начинаться с http:// или https://';
    }
    
    if (formValues.email && !/^\S+@\S+\.\S+$/.test(formValues.email)) {
      newErrors.email = 'Некорректный формат электронной почты';
    }
    
    if (formValues.website && !/^https?:\/\/\S+\.\S+/.test(formValues.website)) {
      newErrors.website = 'URL должен начинаться с http:// или https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (company) {
        // Update existing company
        await editCompany(company.id, {
          name: formValues.name,
          description: formValues.description || '',
          logo: formValues.logo,
          website: formValues.website || '',
          email: formValues.email || '',
          phone: formValues.phone || '',
          address: formValues.address || '',
          color: formValues.color,
          isMain: formValues.isMain
        });
        setSavedMessage('Компания успешно обновлена');
      } else {
        // Add new company
        await addCompany({
          name: formValues.name,
          description: formValues.description || '',
          logo: formValues.logo,
          website: formValues.website || '',
          email: formValues.email || '',
          phone: formValues.phone || '',
          address: formValues.address || '',
          color: formValues.color,
          isMain: formValues.isMain,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSavedMessage('Компания успешно добавлена');
      }
      
      setTimeout(() => {
        onSaved();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving company:', error);
      setSavedMessage('Ошибка при сохранении компании');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const checkLogoUrl = async () => {
    if (!formValues.logo) {
      setLogoPreview(null);
      return;
    }
    
    setCheckingLogo(true);
    
    try {
      const response = await fetch(formValues.logo, { method: 'HEAD' });
      if (response.ok) {
        setLogoPreview(formValues.logo);
        setErrors(prev => ({ ...prev, logo: undefined }));
      } else {
        setLogoPreview(null);
        setErrors(prev => ({ ...prev, logo: 'Не удалось загрузить изображение' }));
      }
    } catch (error) {
      setLogoPreview(null);
      setErrors(prev => ({ ...prev, logo: 'Некорректный URL изображения' }));
    } finally {
      setCheckingLogo(false);
    }
  };
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (formValues.logo) {
        checkLogoUrl();
      }
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [formValues.logo]);
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {company ? 'Редактирование компании' : 'Добавление новой компании'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {savedMessage && (
        <Alert 
          severity={savedMessage.includes('успешно') ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          {savedMessage}
        </Alert>
      )}
      
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Название компании"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          required
          error={!!errors.name}
          helperText={errors.name}
        />
        
        <TextField
          fullWidth
          label="Описание"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
        
        <TextField
          fullWidth
          label="URL логотипа"
          name="logo"
          value={formValues.logo}
          onChange={handleChange}
          required
          error={!!errors.logo}
          helperText={errors.logo}
          InputProps={{
            endAdornment: checkingLogo && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
        />
        
        {logoPreview && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              p: 2, 
              border: '1px solid #ddd', 
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Предпросмотр логотипа
            </Typography>
            <Box
              component="img"
              src={logoPreview}
              alt="Logo preview"
              sx={{
                maxHeight: 100,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
              onError={() => {
                setLogoPreview(null);
                setErrors(prev => ({ ...prev, logo: 'Не удалось загрузить изображение' }));
              }}
            />
          </Box>
        )}
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Цвет компании
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HexColorPicker 
              color={formValues.color}
              onChange={(color: string) => setFormValues(prev => ({ ...prev, color }))}
            />
            <Box>
              <TextField
                label="Цветовой код"
                value={formValues.color}
                onChange={(e) => setFormValues(prev => ({ ...prev, color: e.target.value }))}
                size="small"
                sx={{ mb: 1 }}
              />
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: formValues.color,
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }} 
              />
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        <Typography variant="subtitle1">
          Контактная информация
        </Typography>
        
        <TextField
          fullWidth
          label="Веб-сайт"
          name="website"
          value={formValues.website}
          onChange={handleChange}
          error={!!errors.website}
          helperText={errors.website}
          placeholder="https://example.com"
        />
        
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        
        <TextField
          fullWidth
          label="Телефон"
          name="phone"
          value={formValues.phone}
          onChange={handleChange}
        />
        
        <TextField
          fullWidth
          label="Адрес"
          name="address"
          value={formValues.address}
          onChange={handleChange}
        />
        
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.isMain}
                onChange={handleChange}
                name="isMain"
              />
            }
            label="Основная компания"
          />
          <FormHelperText>
            Отметьте, если это основная компания. Основная компания может быть только одна.
          </FormHelperText>
        </FormControl>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {company ? 'Сохранить' : 'Добавить'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default CompanyForm; 