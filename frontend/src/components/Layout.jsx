import Header from './Header';
import {
  Container,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const { logout, user } = useContext(AuthContext);

  const theme = useTheme();
  const navigate = useNavigate();

  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <>
      <Header onLogout={handleLogout} full_name={user.full_name}/>
      
      {/* <Container sx={{ marginTop: theme.spacing(12), pb: theme.spacing(4) }}>{children}</Container> */}
      <Container sx={{ marginTop: theme.spacing(8), pt: theme.spacing(4), pb: theme.spacing(4) }}>{children}</Container>
    </>
  );
}