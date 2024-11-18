import React from 'react';
import { AppBar, Toolbar, Typography, Button, Divider, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';
import { Link } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1976d2', // Основной цвет AppBar
}));

const Logo = styled('img')(({ theme }) => ({
  width: '40px',
  marginRight: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  whiteSpace: 'nowrap', // Запрет переноса текста
  display: 'inline-block', // Размер соответствует тексту
  textAlign: 'center',
}));

const Header = ({ onLogout, full_name }) => {
  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar>
        <Link to={"/"}>
          <Logo src={LogoMVDKZ} alt="Логотип" />
        </Link>

        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Title variant="h5">E-aigaq</Title>
        </Link>

        <Typography sx={{ textAlign: 'center', ml: 'auto', mr: '1rem', padding: '0  0.5rem' }}>{full_name}</Typography>
        {/* <Typography sx={{ fontSize: '2rem', textAlign: 'center', ml: '1rem', mr: '1rem' }}>|</Typography> */}
        <Divider orientation="vertical" variant="middle" sx={{ borderWidth: '0 0.15rem 0 0', margin: '1rem 0px', borderColor: 'white'}} flexItem />
        <Button color="inherit" onClick={onLogout} sx={{ ml: '1rem' }}>
          Выйти
        </Button>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;