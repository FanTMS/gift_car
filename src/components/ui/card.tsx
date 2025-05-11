import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.3s ease",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 0),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.25rem",
  color: theme.palette.text.primary,
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }; 