// src/components/BiometricDialog.js

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';
import { BiometricAuthButton } from './ui/BiometricAuthButton';

// Стилизация диалогового окна для соответствия единому стилю
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '20px',
    padding: theme.spacing(3),
    paddingBottom: '12px',
    backgroundColor: theme.palette.background.paper,
    transform: 'scale(0.8)',
    transformOrigin: 'center',
  },
}));

const BiometricDialog = ({ open, onClose, onSuccess }) => {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const intervalIdRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  // Функция для инициализации WebSocket-соединения
  const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket соединение установлено.');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.detail) {
        setSuccess('Биометрическая аутентификация успешно пройдена.');
        onSuccess(); // Вызываем callback при успешной аутентификации
        cleanUp();
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      } else if (data.warning) {
        setError(data.warning);
        cleanUp();
      } else if (data.message) {
        setError(data.message);
        cleanUp();
      }
    };

    ws.onclose = () => {
      console.log('WebSocket соединение закрыто.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setError('Произошла ошибка при установлении соединения с сервером.');
      cleanUp();
    };
  };

  // Функция для очистки интервалов, состояния и закрытия WebSocket и камеры
  const cleanUp = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsAuthenticating(false);
    setTimeLeft(10);
  };

  useEffect(() => {
    if (!open) return;

    // Функция для запроса доступа к камере
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Не удалось получить доступ к камере. Пожалуйста, разрешите доступ.');
      }
    };

    getVideo();

    // Очистка при закрытии компонента
    return () => {
      cleanUp();
    };
  }, [open]);

  // Функция для захвата и отправки кадра
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
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            blob.arrayBuffer().then((buffer) => {
              wsRef.current.send(buffer);
            });
          }
        },
        'image/jpeg',
        0.8
      );
    }
  };

  // Функция для начала аутентификации
  const handleStartAuthentication = () => {
    setError(null);
    setSuccess(null);
    setIsAuthenticating(true);
    setTimeLeft(10);

    // Инициализируем WebSocket, если он не открыт
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      initializeWebSocket();
    }

    // Начинаем отправлять кадры каждые 1 секунду
    intervalIdRef.current = setInterval(() => {
      captureAndSendFrame();
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Останавливаем отправку через 10 секунд
    setTimeout(() => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      setIsAuthenticating(false);
      if (!success) {
        setError('Не удалось подтвердить биометрические данные. Попробуйте еще раз.');
        cleanUp();
      }
    }, 10000);
  };

  // Функция для закрытия диалогового окна
  const handleClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    console.log('closed')
    setError(null);
    setSuccess(null);
    cleanUp();
    
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogContent
        sx={{
          m: 0,
          p: 0
        }}
    >
        {/* Верхняя часть с логотипом */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <img
            src={LogoMVDKZ}
            alt="Логотип МВД Казахстана"
            style={{ width: '80px', height: '80px' }}
          />
        </Box>

        {/* Заголовок */}
        <Typography component="h2" variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
          Биометрическая аутентификация
        </Typography>

        {/* Инструкции */}
        <Typography variant="body1" align="center" sx={{ mb: 3, fontSize: '1rem' }}>
          Пожалуйста, убедитесь, что Ваше лицо хорошо видно и Вы находитесь в хорошо освещенном месте без посторонних лиц в кадре.
          Нажмите кнопку ниже, чтобы начать процесс аутентификации.
        </Typography>

        {/* Уведомления об ошибках */}
        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', }}
            style={{ padding: 0 }}
            icon={<ErrorIcon sx={{ mr: 1 }} />}
          >
            {error}
          </Alert>
        )}

        {/* Уведомления об успехе */}
        {success && (
          <Alert
            severity="success"
            sx={{ width: '100%', mb: 2, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', }}
            style={{ padding: 0 }}
            icon={<CheckCircleIcon sx={{ mr: 1 }} />}
          >
            {success}
          </Alert>
        )}

        {/* Видео */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '95%', height: '40vh', borderRadius: '10px', backgroundColor: '#000', objectFit: 'cover', }}
          />
        </Box>

        {/* Кнопка или индикатор загрузки */}
        {isAuthenticating ? (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Идет аутентификация... {timeLeft} секунд(ы)
            </Typography>
          </Box>
        ) : (
          <BiometricAuthButton style={{padding: '1rem 1.5rem'}} onClick={handleStartAuthentication} text={'Начать аутентификацию'} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
        <Button onClick={handleClose} sx={{ fontWeight: 'bold' }}>
          Отмена
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default BiometricDialog;

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogActions,
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
// import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';

// // Стилизация диалогового окна для соответствия единому стилю
// const StyledDialog = styled(Dialog)(({ theme }) => ({
//   '& .MuiPaper-root': {
//     borderRadius: '20px',
//     padding: theme.spacing(3),
//     paddingBottom: '12px',
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

// const BiometricDialog = ({ open, onClose, onSuccess }) => {
//   const videoRef = useRef(null);
//   const wsRef = useRef(null);
//   const intervalIdRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(10);

//   // Функция для закрытия WebSocket-соединения и очистки интервалов
//   const cleanUp = () => {
//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//     if (intervalIdRef.current) {
//       clearInterval(intervalIdRef.current);
//       intervalIdRef.current = null;
//     }
//     setIsAuthenticating(false);
//     setTimeLeft(10);
//   };

//   useEffect(() => {
//     if (!open && error === null) return;

//     // Функция для запроса доступа к камере
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

//     // Установка WebSocket-соединения
//     const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
//     const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
//     const ws = new WebSocket(wsUrl);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log('WebSocket connection established.');
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.detail) {
//         setSuccess('Биометрическая аутентификация успешно пройдена.');
//         onSuccess(); // Вызываем callback при успешной аутентификации
//         cleanUp();
//       } else if (data.warning) {
//         setError(data.warning);
//         cleanUp();
//       } else if (data.message) {
//         setError(data.message);
//         cleanUp();
//       }
//     };

//     ws.onclose = () => {
//       console.log('WebSocket connection closed.');
//       cleanUp();
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setError('Произошла ошибка при установлении соединения с сервером.');
//       cleanUp();
//     };

//     // Очистка при закрытии компонента
//     return () => {
//       cleanUp();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open]);

//   // Функция для захвата и отправки кадра
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
//           if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             blob.arrayBuffer().then((buffer) => {
//               wsRef.current.send(buffer);
//             });
//           }
//         },
//         'image/jpeg',
//         0.8
//       );
//     }
//   };

//   // Функция для начала аутентификации
//   const handleStartAuthentication = () => {
//     setError(null);
//     setSuccess(null);
//     setIsAuthenticating(true);
//     setTimeLeft(10);

//     // Начинаем отправлять кадры каждые 1 секунду
//     intervalIdRef.current = setInterval(() => {
//       captureAndSendFrame();
//       setTimeLeft((prevTime) => prevTime - 1);
//     }, 1000);

//     // Останавливаем отправку через 10 секунд
//     setTimeout(() => {
//       if (intervalIdRef.current) {
//         clearInterval(intervalIdRef.current);
//         intervalIdRef.current = null;
//       }
//       setIsAuthenticating(false);
//       if (!success) {
//         setError('Не удалось подтвердить биометрические данные. Попробуйте еще раз.');
//       }
//     }, 10000);
//   };

//   // Функция для закрытия диалогового окна
//   const handleClose = () => {
//     setError(null);
//     setSuccess(null);
//     cleanUp();
//     onClose();
//   };

//   return (
//     <StyledDialog open={open} onClose={handleClose}>
//       <DialogContent sx={{ m: 0, p: 0 }}>
//         {/* Верхняя часть с логотипом */}
//         <Box sx={{ textAlign: 'center', mb: 1 }}>
//           <img
//             src={LogoMVDKZ}
//             alt="Логотип МВД Казахстана"
//             style={{ width: '80px', height: '80px' }}
//           />
//         </Box>

//         {/* Заголовок */}
//         <Typography
//           component="h2"
//           variant="h5"
//           align="center"
//           sx={{ mb: 2, fontWeight: 'bold' }}
//         >
//           Биометрическая аутентификация
//         </Typography>

//         {/* Инструкции */}
//         <Typography variant="body1" align="center" sx={{ mb: 3, fontSize: '1rem' }}>
//           Пожалуйста, убедитесь, что Ваше лицо хорошо видно и Вы находитесь в хорошо освещенном месте без посторонних лиц в кадре
//           Нажмите кнопку ниже, чтобы начать процесс аутентификации
//         </Typography>
        
//         {/* Дополнительные инструкции */}
//         {/* <Typography variant="body2" align="center" sx={{ mt: 1, color: 'gray' }}>
//           Убедитесь, что .
//         </Typography> */}

//         {/* Уведомления об ошибках */}
//         {error && (
//           <Alert
//             severity="error"
//             sx={{
//               width: '100%',
//               mb: 2,
//               p: 0,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//             style={{padding: 0}}
//             icon={<ErrorIcon sx={{ mr: 1 }} />}
//           >
//             {error}
//           </Alert>
//         )}

//         {/* Уведомления об успехе */}
//         {success && (
//           <Alert
//             severity="success"
//             sx={{
//               width: '100%',
//               mb: 2,
//               p: 0,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//             style={{padding: 0}}

//             icon={<CheckCircleIcon sx={{ mr: 1 }} />}
//           >
//             {success}
//           </Alert>
//         )}

//         {/* Видео */}
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             style={{
//               width: '100%',
//               borderRadius: '10px',
//               backgroundColor: '#000',
//               objectFit: 'cover',
//             }}
//           />
//         </Box>

//         {/* Кнопка или индикатор загрузки */}
//         {isAuthenticating ? (
//           <Box sx={{ textAlign: 'center', mb: 2 }}>
//             <CircularProgress />
//             <Typography variant="body2" sx={{ mt: 1 }}>
//               Идет аутентификация... {timeLeft} секунд(ы)
//             </Typography>
//           </Box>
//         ) : (
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleStartAuthentication}
//             sx={{
//               mb: 2,
//               padding: '0.75em 1.5em',
//               borderRadius: '30px',
//               // width: '100%',
//               display: 'flex',
//               m: 'auto',
//               fontWeight: 'bold',
//               fontSize: '1rem',
//               textTransform: 'none',
//             }}
//             startIcon={<CameraIcon />}
//           >
//             Начать аутентификацию
//           </Button>
//         )}

//       </DialogContent>
//       <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
//         <Button onClick={handleClose} sx={{ fontWeight: 'bold' }}>
//           Отмена
//         </Button>
//       </DialogActions>
//     </StyledDialog>
//   );
// };

// export default BiometricDialog;


// // src/components/BiometricDialog.js
//
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogActions,
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
// import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';
//
// const StyledDialog = styled(Dialog)(({ theme }) => ({
//   '& .MuiPaper-root': {
//     borderRadius: '20px',
//     padding: theme.spacing(2),
//   },
// }));
//
// const BiometricDialog = ({ open, onClose, onSuccess }) => {
//   const videoRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const ws = useRef(null);
//   const intervalId = useRef(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(10);
//
//   useEffect(() => {
//     if (!open) return;
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
//     ws.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.detail) {
//         setSuccess('Биометрическая аутентификация успешно пройдена.');
//         onSuccess(); // Вызываем callback при успешной аутентификации
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
//       setError('Произошла ошибка при установлении соединения с сервером.');
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
//   }, [open, onSuccess]);
//
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
//
//   const handleStartAuthentication = () => {
//     setError(null);
//     setSuccess(null);
//     setIsAuthenticating(true);
//     setTimeLeft(10);
//
//     // Начинаем отправлять кадры каждые 1 секунду
//     intervalId.current = setInterval(() => {
//       captureAndSendFrame();
//       setTimeLeft((prevTime) => prevTime - 1);
//     }, 1000);
//
//     // Останавливаем отправку через 10 секунд
//     setTimeout(() => {
//       if (intervalId.current) {
//         clearInterval(intervalId.current);
//       }
//       setIsAuthenticating(false);
//       if (!success) {
//         setError('Не удалось подтвердить биометрические данные. Попробуйте еще раз.');
//       }
//     }, 10000);
//   };
//
//   const handleClose = () => {
//     setError(null);
//     setSuccess(null);
//     if (intervalId.current) {
//       clearInterval(intervalId.current);
//     }
//     onClose();
//   };
//
//   return (
//     <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//       <DialogContent>
//         {/* Header with Logo */}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <img
//             src={LogoMVDKZ}
//             alt="Логотип МВД Казахстана"
//             style={{ width: '60px', height: '60px' }}
//           />
//         </Box>
//         <Typography
//           component="h2"
//           variant="h5"
//           align="center"
//           sx={{ mb: 2, fontWeight: 'bold' }}
//         >
//           Биометрическая аутентификация
//         </Typography>
//         <Typography variant="body1" align="center" sx={{ mb: 2 }}>
//           Пожалуйста, убедитесь, что ваше лицо хорошо видно в камере. Нажмите кнопку ниже, чтобы начать процесс аутентификации.
//         </Typography>
//         {error && (
//           <Alert
//             severity="error"
//             sx={{
//               width: '100%',
//               mb: 2,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <ErrorIcon sx={{ mr: 1 }} />
//             {error}
//           </Alert>
//         )}
//         {success && (
//           <Alert
//             severity="success"
//             sx={{
//               width: '100%',
//               mb: 2,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <CheckCircleIcon sx={{ mr: 1 }} />
//             {success}
//           </Alert>
//         )}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             style={{ width: '100%', borderRadius: '10px', backgroundColor: '#000' }}
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
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleStartAuthentication}
//             sx={{
//               mb: 2,
//               padding: '0.5em 1em',
//               borderRadius: '30px',
//               width: '100%',
//               fontWeight: 'bold',
//               fontSize: '1rem',
//             }}
//             startIcon={<CameraIcon />}
//           >
//             Начать аутентификацию
//           </Button>
//         )}
//         <Typography variant="body2" align="center" sx={{ mt: 2, color: 'gray' }}>
//           Убедитесь, что вы находитесь в хорошо освещенном месте без посторонних лиц в кадре.
//         </Typography>
//       </DialogContent>
//       <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
//         <Button onClick={handleClose} sx={{ fontWeight: 'bold' }}>
//           Отмена
//         </Button>
//       </DialogActions>
//     </StyledDialog>
//   );
// };
//
// export default BiometricDialog;
