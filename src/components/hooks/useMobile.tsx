import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Custom hook that returns true if the current viewport is mobile sized
 */
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
} 