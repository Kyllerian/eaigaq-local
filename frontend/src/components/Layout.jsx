import Header from './Header';
import {
  Typography,
  Container,
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel, // Добавлено
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const { logout } = useContext(AuthContext);

  const theme = useTheme();
  const navigate = useNavigate();

  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <>
      <Header onLogout={handleLogout}/>
      
      {/* <Container sx={{ marginTop: theme.spacing(12), pb: theme.spacing(4) }}>{children}</Container> */}
      <Container sx={{ marginTop: theme.spacing(8), pt: theme.spacing(4), pb: theme.spacing(4) }}>{children}</Container>
    </>
  );
}