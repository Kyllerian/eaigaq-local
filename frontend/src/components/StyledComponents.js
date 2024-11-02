// src/components/StyledComponents.js

import { styled } from '@mui/material/styles';
import { Button, TableCell } from '@mui/material';

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '5px',
  textTransform: 'none',
  backgroundColor: '#1976d2',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#0d47a1',
  },
  '&.Mui-disabled': {
    backgroundColor: '#cfd8dc',
    color: '#ffffff',
    opacity: 0.7,
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
}));
