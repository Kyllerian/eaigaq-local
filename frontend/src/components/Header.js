// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';

// const StyledAppBar = styled(AppBar)(({ theme }) => ({
//   background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
// }));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1976d2', // Основной цвет AppBar
}));


const Logo = styled('img')(({ theme }) => ({
  width: '40px',
  marginRight: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '1.5rem',
}));

const Header = ({ onLogout }) => {
  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar>
        {/* Иконка меню для мобильных устройств */}
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Logo src={LogoMVDKZ} alt="Логотип" />
        <Title variant="h5">E-aigaq</Title>

        {/*/!* Навигационные кнопки для больших экранов *!/*/}
        {/*<Box sx={{ display: { xs: 'none', md: 'flex' } }}>*/}
        {/*  <Button color="inherit">Главная</Button>*/}
        {/*  <Button color="inherit">О нас</Button>*/}
        {/*  <Button color="inherit">Контакты</Button>*/}
        {/*</Box>*/}

        <Button color="inherit" onClick={onLogout}>
          Выйти
        </Button>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
