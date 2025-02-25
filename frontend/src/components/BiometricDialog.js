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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      console.log(t('biometric.biometric_registration.ws_connection_established'));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.detail) {
        setSuccess(t('biometric.biometric_authentication.auth_success_message'));
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
      console.log(t('biometric.biometric_registration.ws_connection_closed'));
    };

    ws.onerror = (error) => {
      console.error(t('biometric.biometric_registration.ws_connection_error'), error);
      setError(t('biometric.biometric_registration.ws_connection_error'));
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
        setError(t('biometric.biometric_registration.camera_access_error'));
      }
    };

    getVideo();

    // Очистка при закрытии компонента
    return () => {
      cleanUp();
    };
  }, [open, t]);

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
        setError(t('biometric.biometric_authentication.auth_failed'));
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
            alt={t('biometric.biometric_registration.logo_alt')}
            style={{ width: '80px', height: '80px' }}
          />
        </Box>

        {/* Заголовок */}
        <Typography component="h2" variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
        {t('biometric.biometric_authentication.page_title')}
        </Typography>

        {/* Инструкции */}
        <Typography variant="body1" align="center" sx={{ mb: 3, fontSize: '1rem' }}>
        {t('biometric.biometric_registration.page_description')}
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
            {t('biometric.biometric_authentication.authentication_in_progress')}{' '}
            {timeLeft} {t('biometric.biometric_registration.seconds')}
            </Typography>
          </Box>
        ) : (
          <BiometricAuthButton style={{padding: '1rem 1.5rem'}} onClick={handleStartAuthentication} text={t('biometric.biometric_authentication.start_authentication_button')} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
        <Button onClick={handleClose} sx={{ fontWeight: 'bold' }}>
        {t('common.buttons.cancel')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default BiometricDialog;
