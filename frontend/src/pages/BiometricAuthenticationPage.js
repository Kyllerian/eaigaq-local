// src/pages/BiometricAuthenticationPage.js

import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';
import { BiometricAuthButton } from '../components/ui/BiometricAuthButton';
import { useTranslation } from 'react-i18next';

const Screen = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '30px',
  boxShadow: '0 0 2em rgba(0, 0, 0, 0.1)',
  maxWidth: '500px',
  margin: 'auto',
}));

function BiometricAuthenticationPage() {
  const { t } = useTranslation();
  const {
    biometricRequired,
    biometricRegistrationRequired,
    fetchCurrentUser,
    setBiometricRequired,
    setBiometricRegistrationRequired,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const ws = useRef(null);
  const intervalId = useRef(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!biometricRequired || biometricRegistrationRequired) {
      navigate('/');
      return;
    }

    // Запрос доступа к камере
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(t('biometric.biometric_registration.camera_access_error'));
      }
    };
    getVideo();

    // Устанавливаем WebSocket-соединение
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log(t('biometric.biometric_registration.ws_connection_established'));
    };

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.detail) {
        setSuccess(data.detail);
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        sessionStorage.setItem('user_authentificated', 'true');
        // Обновляем информацию о пользователе
        const updatedUser = await fetchCurrentUser();
        if (updatedUser && updatedUser.biometric_registered) {
          setBiometricRequired(false);
          setBiometricRegistrationRequired(false);
          navigate('/');
        }
      } else if (data.warning) {
        setError(data.warning);
      } else if (data.message) {
        setError(data.message);
      }
    };

    ws.current.onclose = () => {
      console.log(t('biometric.biometric_registration.ws_connection_closed'));
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };

    ws.current.onerror = (error) => {
      console.error(t('biometric.biometric_registration.ws_connection_error'), error);
      setError(t('biometric.biometric_registration.ws_connection_error'));
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [biometricRequired, biometricRegistrationRequired, navigate, fetchCurrentUser, setBiometricRequired, setBiometricRegistrationRequired, t]);

  const captureAndSendFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    if (video && video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            blob.arrayBuffer().then((buffer) => {
              ws.current.send(buffer);
            });
          }
        },
        'image/jpeg',
        0.8
      );
    }
  };

  const handleStartAuthentication = () => {
    setError(null);
    setSuccess(null);
    setIsAuthenticating(true);
    setTimeLeft(10);

    // Начинаем отправлять кадры каждые 1 секунду
    intervalId.current = setInterval(() => {
      captureAndSendFrame();
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Останавливаем отправку через 10 секунд
    setTimeout(() => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      setIsAuthenticating(false);
    }, 10000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#e9edf5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Screen>
        {/* sx={{padding: '1.75em'}}> */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src={LogoMVDKZ}
            alt={t('biometric.biometric_registration.logo_alt')}
            style={{ width: '80px', height: '80px' }}
          />
        </Box>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('biometric.biometric_authentication.page_title')}
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, fontSize: '0.9rem' }}>
          {t('biometric.biometric_registration.page_description')}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center' }}
            style={{ padding: 0 }}
            icon={<ErrorIcon sx={{ mr: 1 }} />}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center' }}
            style={{ padding: 0 }}
            icon={<CheckCircleIcon sx={{ mr: 1 }} />}
          >
            {success}
          </Alert>
        )}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: '10px' }}
          />
        </Box>
        {isAuthenticating ? (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('biometric.biometric_authentication.authentication_in_progress')}{' '}
              {timeLeft} {t('biometric.biometric_registration.seconds')}
            </Typography>
          </Box>
        ) : (
          <BiometricAuthButton onClick={handleStartAuthentication} text={t('biometric.biometric_authentication.start_authentication_button')} />
        )}
      </Screen>
    </Box>
  );
}

export default BiometricAuthenticationPage;
// // src/pages/BiometricAuthenticationPage.js

// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { AuthContext } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import {
//   Button,
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import CameraIcon from '@mui/icons-material/Camera';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import ErrorIcon from '@mui/icons-material/Error';
// import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';
// import { BiometricAuthButton } from '../components/ui/BiometricAuthButton';

// const Screen = styled(Box)(({ theme }) => ({
//   background: theme.palette.background.default,
//   padding: '2em',
//   display: 'flex',
//   flexDirection: 'column',
//   borderRadius: '30px',
//   boxShadow: '0 0 2em rgba(0, 0, 0, 0.1)',
//   maxWidth: '500px',
//   margin: 'auto',
// }));

// function BiometricAuthenticationPage() {
//   const {
//     biometricRequired,
//     biometricRegistrationRequired,
//     fetchCurrentUser,
//     setBiometricRequired,
//     setBiometricRegistrationRequired,
//   } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const videoRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const ws = useRef(null);
//   const intervalId = useRef(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(10);

//   useEffect(() => {
//     if (!biometricRequired || biometricRegistrationRequired) {
//       navigate('/');
//       return;
//     }

//     // Запрос доступа к камере
//     const getVideo = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (err) {
//         setError('Не удалось получить доступ к камере. Пожалуйста, разрешите доступ.');
//       }
//     };
//     getVideo();

//     // Устанавливаем WebSocket-соединение
//     const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
//     const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log('WebSocket connection established.');
//     };

//     ws.current.onmessage = async (event) => {
//       const data = JSON.parse(event.data);
//       if (data.detail) {
//         setSuccess(data.detail);
//         if (videoRef.current && videoRef.current.srcObject) {
//           videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//           videoRef.current.srcObject = null;
//         }
//         sessionStorage.setItem('user_authentificated', 'true');
//         // Обновляем информацию о пользователе
//         const updatedUser = await fetchCurrentUser();
//         if (updatedUser && updatedUser.biometric_registered) {
//           setBiometricRequired(false);
//           setBiometricRegistrationRequired(false);
//           navigate('/');
//         }
//       } else if (data.warning) {
//         setError(data.warning);
//       } else if (data.message) {
//         setError(data.message);
//       }
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed.');
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     };

//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setError('Произошла ошибка при установлении соединения с сервером.');
//     };

//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     };
//   }, [
//     biometricRequired,
//     biometricRegistrationRequired,
//     navigate,
//     fetchCurrentUser,
//     setBiometricRequired,
//     setBiometricRegistrationRequired,
//   ]);

//   const captureAndSendFrame = () => {
//     const video = videoRef.current;
//     const canvas = document.createElement('canvas');
//     if (video && video.videoWidth && video.videoHeight) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob(
//         (blob) => {
//           if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//             blob.arrayBuffer().then((buffer) => {
//               ws.current.send(buffer);
//             });
//           }
//         },
//         'image/jpeg',
//         0.8
//       );
//     }
//   };

//   const handleStartAuthentication = () => {
//     setError(null);
//     setSuccess(null);
//     setIsAuthenticating(true);
//     setTimeLeft(10);

//     // Начинаем отправлять кадры каждые 1 секунду
//     intervalId.current = setInterval(() => {
//       captureAndSendFrame();
//       setTimeLeft((prevTime) => prevTime - 1);
//     }, 1000);

//     // Останавливаем отправку через 10 секунд
//     setTimeout(() => {
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//       setIsAuthenticating(false);
//     }, 10000);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         backgroundColor: '#e9edf5',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Screen> 
//          {/* sx={{padding: '1.75em'}}> */}
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <img
//             src={LogoMVDKZ}
//             alt="Логотип МВД Казахстана"
//             style={{ width: '80px', height: '80px' }}
//           />
//         </Box>
//         <Typography component="h1" variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
//           Биометрическая аутентификация
//         </Typography>
//         <Typography variant="body2" align="center" sx={{ mb: 3, fontSize: '0.9rem' }}>
//           Пожалуйста, убедитесь, что Ваше лицо хорошо видно и Вы находитесь в хорошо освещенном месте без посторонних лиц в кадре.
//           Нажмите кнопку ниже, чтобы начать процесс аутентификации.
//         </Typography>

//         {error && (
//           <Alert
//             severity="error"
//             sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center' }}
//             style={{ padding: 0 }}
//             icon={<ErrorIcon sx={{ mr: 1 }} />}
//           >
//             {error}
//           </Alert>
//         )}
//         {success && (
//           <Alert
//             severity="success"
//             sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center' }}
//             style={{ padding: 0 }}
//             icon={<CheckCircleIcon sx={{ mr: 1 }} />}
//           >
//             {success}
//           </Alert>
//         )}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             style={{ width: '100%', borderRadius: '10px' }}
//           />
//         </Box>
//         {isAuthenticating ? (
//           <Box sx={{ textAlign: 'center', mb: 2 }}>
//             <CircularProgress />
//             <Typography variant="body2" sx={{ mt: 1 }}>
//               Идет аутентификация... {timeLeft} секунд(ы)
//             </Typography>
//           </Box>
//         ) : (
//           <BiometricAuthButton onClick={handleStartAuthentication} text={'Начать аутентификацию'} />
//         )}
//       </Screen>
//     </Box>
//   );
// }

// export default BiometricAuthenticationPage;

// // src/pages/BiometricAuthenticationPage.js
//
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { AuthContext } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import {
//   Button,
//   Box,
//   Typography,
//   Alert,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';
//
// const Screen = styled(Box)(({ theme }) => ({
//   background: theme.palette.background.default,
//   padding: '2em',
//   display: 'flex',
//   flexDirection: 'column',
//   borderRadius: '30px',
//   boxShadow: '0 0 2em rgba(0, 0, 0, 0.1)',
//   maxWidth: '500px',
//   margin: 'auto',
// }));
//
// function BiometricAuthenticationPage() {
//   const { biometricRequired, biometricRegistrationRequired, fetchCurrentUser, setBiometricRequired, setBiometricRegistrationRequired } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const videoRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const ws = useRef(null);
//   const intervalId = useRef(null);
//
//   useEffect(() => {
//     // Проверка, требуется ли биометрическая аутентификация и не требуется ли регистрация биометрии
//     if (!biometricRequired || biometricRegistrationRequired) {
//       navigate('/');
//       return;
//     }
//
//     // Запрос доступа к камере
//     const getVideo = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (err) {
//         setError('Не удалось получить доступ к камере. Пожалуйста, разрешите доступ.');
//       }
//     };
//     getVideo();
//
//     // Устанавливаем WebSocket-соединение
//     const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
//     const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
//     ws.current = new WebSocket(wsUrl);
//
//     ws.current.onopen = () => {
//       console.log('WebSocket connection established.');
//     };
//
//     ws.current.onmessage = async (event) => {
//       const data = JSON.parse(event.data);
//       if (data.detail) {
//         setSuccess(data.detail);
//         // Обновляем информацию о пользователе
//         const updatedUser = await fetchCurrentUser();
//         if (updatedUser && updatedUser.biometric_registered) {
//           setBiometricRequired(false);
//           setBiometricRegistrationRequired(false);
//           navigate('/');
//         }
//       } else if (data.warning) {
//         setError(data.warning);
//       } else if (data.message) {
//         setSuccess(data.message);
//       }
//     };
//
//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed.');
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     };
//
//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setError('Произошла ошибка при установлении WebSocket-соединения.');
//     };
//
//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     };
//   }, [biometricRequired, biometricRegistrationRequired, navigate, fetchCurrentUser, setBiometricRequired, setBiometricRegistrationRequired]);
//
//   const captureAndSendFrame = () => {
//     const video = videoRef.current;
//     const canvas = document.createElement('canvas');
//     if (video && video.videoWidth && video.videoHeight) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob((blob) => {
//         if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//           blob.arrayBuffer().then((buffer) => {
//             ws.current.send(buffer);
//           });
//         }
//       }, 'image/jpeg');
//     }
//   };
//
//   const handleStartAuthentication = () => {
//     setError(null);
//     setSuccess(null);
//     // Начинаем отправлять кадры каждые 1 секунду
//     intervalId.current = setInterval(() => {
//       captureAndSendFrame();
//     }, 1000);
//
//     // Останавливаем отправку через 10 секунд
//     setTimeout(() => {
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//     }, 10000);
//   };
//
//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         backgroundColor: '#e9edf5',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       <Screen>
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <img
//             src={LogoMVDKZ}
//             alt="Логотип МВД Казахстана"
//             style={{ width: '80px', height: '80px' }}
//           />
//         </Box>
//         <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
//           Биометрическая аутентификация
//         </Typography>
//         {error && (
//           <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//         {success && (
//           <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
//             {success}
//           </Alert>
//         )}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '10px' }} />
//         </Box>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleStartAuthentication}
//           sx={{
//             mb: 2,
//             padding: '0.5em 1em',
//             borderRadius: '30px',
//           }}
//         >
//           Начать аутентификацию
//         </Button>
//       </Screen>
//     </Box>
//   );
// }
//
// export default BiometricAuthenticationPage;
