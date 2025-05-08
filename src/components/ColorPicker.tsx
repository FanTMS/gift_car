import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Box, Typography, TextField } from '@mui/material';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label = 'Color' }) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 300, mb: 2 }}>
      {label && <Typography variant="subtitle1" gutterBottom>{label}</Typography>}
      
      <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', marginBottom: '12px' }} />
      
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mt: 1 }}
        InputProps={{
          startAdornment: (
            <Box 
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: color, 
                borderRadius: 1, 
                mr: 1, 
                border: '1px solid rgba(0,0,0,0.1)' 
              }} 
            />
          ),
        }}
      />
    </Box>
  );
};

export default ColorPicker; 