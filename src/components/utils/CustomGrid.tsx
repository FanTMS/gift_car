import React from 'react';
import { Grid as MuiGrid } from '@mui/material';

interface SizeProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface CustomGridProps {
  size?: SizeProps;
  item?: boolean;
  container?: boolean;
  spacing?: number;
  children?: React.ReactNode;
  key?: React.Key;
  sx?: any;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

const Grid = ({ size, children, ...rest }: CustomGridProps) => {
  const props: any = { ...rest };
  
  // Добавляем item=true по умолчанию, если явно не указан container
  if (props.container !== true && props.item === undefined) {
    props.item = true;
  }
  
  // Преобразуем проп size в соответствующие пропсы Grid
  if (size) {
    if (size.xs !== undefined) props.xs = size.xs;
    if (size.sm !== undefined) props.sm = size.sm;
    if (size.md !== undefined) props.md = size.md;
    if (size.lg !== undefined) props.lg = size.lg;
    if (size.xl !== undefined) props.xl = size.xl;
  }
  
  return <MuiGrid {...props}>{children}</MuiGrid>;
};

export default Grid; 