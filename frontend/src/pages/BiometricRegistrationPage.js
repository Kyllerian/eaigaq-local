// src/pages/BiometricRegistrationPage.js

import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';

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

function BiometricRegistrationPage() {
  const { biometricRegistrationRequired, fetchCurrentUser, setBiometricRequired, setBiometricRegistrationRequired } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const ws = useRef(null);
  const intervalId = useRef(null);

  useEffect(() => {
    // Проверка, требуется ли регистрация биометрии
    if (!biometricRegistrationRequired) {
      console.log("Biometric registration not required. Redirecting to home.");
      navigate('/');
      return;
    }

    // Запрос доступа к камере
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Camera access granted.");
        }
      } catch (err) {
        setError('Не удалось получить доступ к камере. Пожалуйста, разрешите доступ.');
        console.error("Camera access error:", err);
      }
    };
    getVideo();

    // Устанавливаем WebSocket-соединение
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/biometric/`;
    console.log("Attempting to connect to WebSocket at:", wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.current.onmessage = async (event) => {
      console.log('WebSocket message received:', event.data);
      const data = JSON.parse(event.data);
      if (data.detail) {
        setSuccess(data.detail);
        // Обновляем информацию о пользователе
        const updatedUser = await fetchCurrentUser();
        if (updatedUser && updatedUser.biometric_registered) {
          console.log("Biometric registration successful. Redirecting to home.");
          setBiometricRequired(false);
          setBiometricRegistrationRequired(false);
          navigate('/');
        }
      } else if (data.warning) {
        setError(data.warning);
      } else if (data.message) {
        setSuccess(data.message);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed.');
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Произошла ошибка при установлении WebSocket-соединения.');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log("WebSocket connection closed on component unmount.");
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [biometricRegistrationRequired, navigate, fetchCurrentUser, setBiometricRequired, setBiometricRegistrationRequired]);

  const captureAndSendFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    if (video && video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buffer) => {
            console.log("Sending frame to WebSocket.");
            ws.current.send(buffer);
          });
        } else {
          console.warn("WebSocket is not open. Cannot send frame.");
        }
      }, 'image/jpeg');
    } else {
      console.warn("Video element not ready.");
    }
  };

  const handleStartRegistration = () => {
    setError(null);
    setSuccess(null);
    console.log("Starting biometric registration.");

    // Начинаем отправлять кадры каждые 1 секунду
    intervalId.current = setInterval(() => {
      captureAndSendFrame();
    }, 1000);

    // Останавливаем отправку через 10 секунд
    setTimeout(() => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        console.log("Stopped sending frames after 10 seconds.");
      }
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
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src={LogoMVDKZ}
            alt="Логотип МВД Казахстана"
            style={{ width: '80px', height: '80px' }}
          />
        </Box>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
          Регистрация биометрии
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '10px' }} />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartRegistration}
          sx={{
            mb: 2,
            padding: '0.5em 1em',
            borderRadius: '30px',
          }}
        >
          Начать регистрацию
        </Button>
      </Screen>
    </Box>
  );
}

export default BiometricRegistrationPage;
