// src/pages/LoginPage.js

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';

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
  // boxShadow: '0 0 2em rgba(0, 0, 0, 0.05)',
  marginBottom: '1em',
  '& .MuiInputBase-root': {
    borderRadius: '20px',
    border: '1px solid rgba(0, 0, 0, 0.2)',
  },
  '& .MuiFormLabel-root': {
    background: 'white',
    paddingLeft: '6px',
    paddingRight: '6px',
  },
  '& .MuiInputBase-input': {
    paddingLeft: '8px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input:-webkit-autofill':
  // input:-webkit-autofill:hover,
  // input:-webkit-autofill:focus,
  // input:-webkit-autofill:active
  {
    WebkitBackgroundClip: 'text',
    // WebkitTextFillColor: '#ffffff',
    transition: 'background-color 5000s ease-in-out 0s',
    boxShadow: 'rgba(35, 35, 35, 0.0) 0px 0px 20px 20px inset',
  },
  '& .MuiFormLabel-asterisk': {
    display: 'none'
  }
}));

function LoginPage() {
  const { t } = useTranslation();

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

  const handleOpenManual = () => {
    navigate(`/manual`);
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
            alt={t('common.logo_alt')}
            style={{ width: '80px', height: '80px' }}
          />
        </Box>
        {/* Заголовок */}
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
          {t('login_page.title')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: 'auto', mb: 2 }}>
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
            label={t('common.logins.input_name')}
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LoginIcon color="action" />
                  {/* <MailOutlineIcon color="action" /> */}
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
            label={t('common.logins.password')}
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
            {t('login_page.button_login')}

          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9em',
            color: '#666',
            mt: 2,
          }}
        >
          <Button component="a" href={`${process.env.REACT_APP_BACKEND_URL}api/download/certificate/`} download sx={{ fontSize: '0.6rem', textDecoration: 'underline', mx: 'auto', display: 'flex' }}>
            {t('login_page.download_cert')}

          </Button>
        </Box>
      </Screen>
      <Box
        sx={{
          display: 'flex',
          position: "absolute",
          bottom: "1rem",
          right: "2rem",
          justifyContent: 'space-between',
          fontSize: '0.9em',
          color: '#666',
          mt: 2,
        }}
      >
        <Button onClick={handleOpenManual} sx={{
          fontSize: '0.6rem',
          background: "#ffffff",
          boxShadow: "0 0 4px 2px rgba(0,0,0, 0.2)",
          mx: 'auto',
          display: 'flex',
          '&:hover': {
            backgroundColor: '#dddddd', // Цвет кнопки при наведении
          },
        }}>
          {t('login_page.open_manual')}
        </Button>
      </Box>
    </Box>
  );
}

export default LoginPage;

// // src/pages/LoginPage.js

// import React, { useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';
// import {
//   Button,
//   TextField,
//   Box,
//   Typography,
//   Alert,
//   IconButton,
//   InputAdornment,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import LoginIcon from '@mui/icons-material/Login';

// import MailOutlineIcon from '@mui/icons-material/MailOutline';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';

// // Создаём стилизованный компонент с использованием Material-UI styled API
// const Screen = styled(Box)(({ theme }) => ({
//   background: theme.palette.background.default,
//   padding: '2em',
//   display: 'flex',
//   flexDirection: 'column',
//   borderRadius: '30px',
//   boxShadow: '0 0 2em rgba(0, 0, 0, 0.1)',
//   maxWidth: '400px',
//   margin: 'auto',
// }));

// const InputField = styled(TextField)(({ theme }) => ({
//   background: '#fff',
//   borderRadius: '20px',
//   // boxShadow: '0 0 2em rgba(0, 0, 0, 0.05)',
//   marginBottom: '1em',
//   '& .MuiInputBase-root': {
//     borderRadius: '20px',
//     border: '1px solid rgba(0, 0, 0, 0.2)',
//   },
//   '& .MuiFormLabel-root': {
//     background: 'white',
//     paddingLeft: '6px',
//     paddingRight: '6px',
//   },
//   '& .MuiInputBase-input': {
//     paddingLeft: '8px',
//   },
//   '& .MuiOutlinedInput-notchedOutline': {
//     border: 'none',
//   },
//   '& .MuiInputBase-input:-webkit-autofill':
//   // input:-webkit-autofill:hover,
//   // input:-webkit-autofill:focus,
//   // input:-webkit-autofill:active
//   {
//     WebkitBackgroundClip: 'text',
//     // WebkitTextFillColor: '#ffffff',
//     transition: 'background-color 5000s ease-in-out 0s',
//     boxShadow: 'rgba(35, 35, 35, 0.0) 0px 0px 20px 20px inset',
//   },
//   '& .MuiFormLabel-asterisk': {
//     display: 'none'
//   }
// }));

// function LoginPage() {
//   const { login, biometricRequired, biometricRegistrationRequired } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (biometricRequired && !biometricRegistrationRequired) {
//       // Если требуется биометрическая аутентификация
//       navigate('/biometric-authentication');
//     } else if (biometricRegistrationRequired) {
//       // Если требуется регистрация биометрии
//       navigate('/register-biometric');
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [biometricRequired, biometricRegistrationRequired]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError(null);
//     const result = await login(username, password);
//     if (result.success) {
//       if (result.biometricRequired) {
//         navigate('/biometric-authentication');
//       } else if (result.biometricRegistrationRequired) {
//         navigate('/register-biometric');
//       } else {
//         navigate('/');
//       }
//     } else {
//       setError(result.message);
//     }
//   };

//   const handleClickShowPassword = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleOpenManual = () => {
//     navigate(`/manual`);
//   };
//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         backgroundColor: '#e9edf5', // Фоновый цвет страницы
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Screen>
//         {/* Логотип */}
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <img
//             src={LogoMVDKZ}
//             alt="Логотип МВД Казахстана"
//             style={{ width: '80px', height: '80px' }}
//           />
//         </Box>
//         {/* Заголовок */}
//         <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
//           Вход
//         </Typography>
//         {error && (
//           <Alert severity="error" sx={{ width: 'auto', mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//         {/* Форма входа */}
//         <Box component="form" noValidate onSubmit={handleLogin}>
//           {/* Поле для имени пользователя */}
//           <InputField
//             variant="outlined"
//             required
//             fullWidth
//             id="username"
//             label="Имя пользователя"
//             name="username"
//             autoComplete="username"
//             autoFocus
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <LoginIcon color="action" />
//                   {/* <MailOutlineIcon color="action" /> */}
//                 </InputAdornment>
//               ),
//             }}
//           />
//           {/* Поле для пароля */}
//           <InputField
//             variant="outlined"
//             required
//             fullWidth
//             name="password"
//             label="Пароль"
//             type={showPassword ? 'text' : 'password'}
//             id="password"
//             autoComplete="current-password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <LockOutlinedIcon color="action" />
//                 </InputAdornment>
//               ),
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={handleClickShowPassword} edge="end">
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           {/* Кнопка входа */}
//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{
//               mt: 2,
//               mb: 2,
//               padding: '1em',
//               borderRadius: '30px',
//               fontWeight: '600',
//               backgroundColor: '#1976d2', // Основной цвет кнопки
//               '&:hover': {
//                 backgroundColor: '#0d47a1', // Цвет кнопки при наведении
//               },
//             }}
//           >
//             Войти
//           </Button>
//         </Box>

//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             fontSize: '0.9em',
//             color: '#666',
//             mt: 2,
//           }}
//         >
//           <Button component="a" href={`${process.env.REACT_APP_BACKEND_URL}api/download/certificate/`} download sx={{ fontSize: '0.6rem', textDecoration: 'underline', mx: 'auto', display: 'flex' }}>
//             Скачать сертификат
//           </Button>
//         </Box>
//       </Screen>
//       <Box
//         sx={{
//           display: 'flex',
//           position: "absolute",
//           bottom: "1rem",
//           right: "2rem",
//           justifyContent: 'space-between',
//           fontSize: '0.9em',
//           color: '#666',
//           mt: 2,
//         }}
//       >
//         <Button onClick={handleOpenManual} sx={{
//           fontSize: '0.6rem',
//           background: "#ffffff",
//           boxShadow: "0 0 4px 2px rgba(0,0,0, 0.2)",
//           mx: 'auto',
//           display: 'flex',
//           '&:hover': {
//             backgroundColor: '#dddddd', // Цвет кнопки при наведении
//           },
//         }}>
//           Открыть мануал
//         </Button>
//       </Box>
//     </Box>
//   );
// }

// export default LoginPage;
