// src/pages/LoginPage.js

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Avatar,
  Button,
  TextField,
  Paper,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';

// Создаём стилизованный компонент с использованием Material-UI styled API
const Screen = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '30px',
  boxShadow: '0 0 2em rgba(0, 0, 0, 0.1)',
  maxWidth: '400px',
  margin: 'auto',
}));

const InputField = styled(TextField)(({ theme }) => ({
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 0 2em rgba(0, 0, 0, 0.05)',
  marginBottom: '1em',
  '& .MuiInputBase-root': {
    borderRadius: '20px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

function LoginPage() {
  const { login, biometricRequired, biometricRegistrationRequired } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (biometricRequired && !biometricRegistrationRequired) {
      // Если требуется биометрическая аутентификация
      navigate('/biometric-authentication');
    } else if (biometricRegistrationRequired) {
      // Если требуется регистрация биометрии
      navigate('/register-biometric');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricRequired, biometricRegistrationRequired]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(username, password);
    if (result.success) {
      if (result.biometricRequired) {
        navigate('/biometric-authentication');
      } else if (result.biometricRegistrationRequired) {
        navigate('/register-biometric');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#e9edf5', // Фоновый цвет страницы
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Screen>
        {/* Логотип */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src={LogoMVDKZ}
            alt="Логотип МВД Казахстана"
            style={{ width: '80px', height: '80px' }}
          />
        </Box>
        {/* Заголовок */}
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
          Вход
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {/* Форма входа */}
        <Box component="form" noValidate onSubmit={handleLogin}>
          {/* Поле для имени пользователя */}
          <InputField
            variant="outlined"
            required
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          {/* Поле для пароля */}
          <InputField
            variant="outlined"
            required
            fullWidth
            name="password"
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Кнопка входа */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              padding: '1em',
              borderRadius: '30px',
              fontWeight: '600',
              backgroundColor: '#1976d2', // Основной цвет кнопки
              '&:hover': {
                backgroundColor: '#0d47a1', // Цвет кнопки при наведении
              },
            }}
          >
            Войти
          </Button>
        </Box>
        {/* Дополнительные ссылки */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9em',
            color: '#666',
            mt: 2,
          }}
        >
          {/* Здесь можно добавить ссылки, например, на регистрацию */}
        </Box>
      </Screen>
    </Box>
  );
}

export default LoginPage;
