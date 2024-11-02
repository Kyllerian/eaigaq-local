// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';
import { Link } from 'react-router-dom';



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
        <Link to={"/"}>
          <Logo src={LogoMVDKZ} alt="Логотип" />
        </Link>

        <Link to={"/"} style={{flexGrow: 1, textDecoration: "none"}}>
          <Title variant="h5">E-aigaq</Title>
        </Link>

        <Button color="inherit" onClick={onLogout}>
          Выйти
        </Button>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
