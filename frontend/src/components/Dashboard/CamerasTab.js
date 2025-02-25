// frontend/src/components/Dashboard/CamerasTab.js

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Janus from 'janus-gateway';
import adapter from 'webrtc-adapter';
import axios from '../../axiosConfig';

import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
} from '@mui/material';

import JanusPlayer from './JanusPlayer';

const JANUS_WS_URL = 'wss://80.254.125.77/janus_ws/';
const getJanusDeps = Janus.useDefaultDependencies;
const janusDeps = getJanusDeps({ adapter });

const CamerasTab = ({ user, setSnackbar }) => {
    const [loading, setLoading] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [error, setError] = useState(null);

    // Флаг инициализации Janus
    const [janusInitialized, setJanusInitialized] = useState(false);
    const [janusVersion, setJanusVersion] = useState('');

    // Выбранная камера (по клику в списке)
    const [selectedCamera, setSelectedCamera] = useState(null);

    // ID mountpoint’а, если идёт просмотр
    const [mountpointId, setMountpointId] = useState(null);

    // ID CameraViewingSession (для пинга/удаления)
    const [cameraViewingSessionId, setCameraViewingSessionId] = useState(null);
    const pingIntervalRef = useRef(null);

    // Активная модельная Session (/api/sessions/?active=true)
    const [activeSessionId, setActiveSessionId] = useState(null);

    const isUnmountedRef = useRef(false);

    /* ------------------------------------------------------------------
       1) Инициализация Janus
    ------------------------------------------------------------------ */
    useEffect(() => {
        if (!janusInitialized) {
            Janus.init({
                debug: 'all',
                dependencies: janusDeps,
                callback: () => {
                    setJanusVersion('1.3.x (manual init)');
                    setJanusInitialized(true);
                },
            });
        }
    }, [janusInitialized]);

    /* ------------------------------------------------------------------
       2) Загрузка списка камер
    ------------------------------------------------------------------ */
    const loadCameras = useCallback(() => {
        setLoading(true);
        axios
            .get('/api/cameras/')
            .then((res) => {
                setCameras(res.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching cameras:', err);
                setError('Не удалось загрузить список камер');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user) {
            loadCameras();
        }
    }, [user, loadCameras]);

    /* ------------------------------------------------------------------
       3) Загрузка активной Session (model)
    ------------------------------------------------------------------ */
    const loadActiveSession = useCallback(async () => {
        try {
            const resp = await axios.get('/api/sessions/?active=true');
            if (Array.isArray(resp.data) && resp.data.length > 0) {
                setActiveSessionId(resp.data[0].id);
            } else {
                setActiveSessionId(null);
            }
        } catch (err) {
            console.error('Error loadActiveSession:', err);
            setActiveSessionId(null);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadActiveSession();
        }
    }, [user, loadActiveSession]);

    /* ------------------------------------------------------------------
       4) Начать просмотр камеры
    ------------------------------------------------------------------ */
    const handleStartWatching = async (camera) => {
        if (!camera || !activeSessionId) {
            console.warn('No camera or no activeSessionId => skip');
            return;
        }
        try {
            // Запоминаем выбранную камеру
            setSelectedCamera(camera);

            // Сбрасываем текущее состояние стрима
            setMountpointId(null);
            setCameraViewingSessionId(null);

            // start_watching => increment viewer
            const resp1 = await axios.post(`/api/cameras/${camera.id}/start_watching/`);
            const mp_id = resp1.data.mountpoint_id;
            setMountpointId(mp_id);

            // Создаём camera_viewing_session
            const cvsResp = await axios.post('/api/camera_viewing_sessions/', {
                session_id: activeSessionId,
                camera_id: camera.id,
            });
            const newCvsId = cvsResp.data.id;
            setCameraViewingSessionId(newCvsId);

            // Периодический пинг
            pingIntervalRef.current = window.setInterval(() => {
                axios
                    .post(`/api/camera_viewing_sessions/${newCvsId}/ping/`)
                    .catch((err) => {
                        console.warn('ping_viewing error:', err);
                    });
            }, 5000);

            // Обновим список (viewers_count)
            loadCameras();

            // Уведомление
            if (setSnackbar) {
                setSnackbar({
                    open: true,
                    message: `Начали просмотр: ${camera.name} (mp=${mp_id})`,
                    severity: 'success',
                });
            }
        } catch (err) {
            console.error('Error start_watching or create CameraViewingSession:', err);
            setMountpointId(null);
            setCameraViewingSessionId(null);

            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
            if (setSnackbar) {
                setSnackbar({
                    open: true,
                    message: 'Ошибка при запуске просмотра',
                    severity: 'error',
                });
            }
        }
    };

    /* ------------------------------------------------------------------
       5) Остановить просмотр
    ------------------------------------------------------------------ */
    const handleStopWatching = useCallback(async () => {
        if (!selectedCamera) return;
        const cam = selectedCamera;

        // Удаляем CameraViewingSession
        if (cameraViewingSessionId) {
            try {
                await axios.delete(`/api/camera_viewing_sessions/${cameraViewingSessionId}/`);
            } catch (delErr) {
                console.warn('DELETE camera_viewing_sessions failed:', delErr);
            }
        }
        setCameraViewingSessionId(null);

        // Очищаем интервал
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        // stop_watching => decrement_viewer
        try {
            await axios.post(`/api/cameras/${cam.id}/stop_watching/`);
            setMountpointId(null);
            loadCameras();

            if (setSnackbar) {
                setSnackbar({
                    open: true,
                    message: `Остановили просмотр: ${cam.name}`,
                    severity: 'info',
                });
            }
        } catch (err) {
            console.error('Error stop_watching:', err);
            setMountpointId(null);

            if (setSnackbar) {
                setSnackbar({
                    open: true,
                    message: 'Ошибка при остановке просмотра',
                    severity: 'error',
                });
            }
        } finally {
            // Если нужно сбрасывать выбранную камеру:
            // setSelectedCamera(null);
        }
    }, [selectedCamera, cameraViewingSessionId, loadCameras, setSnackbar]);

    /* ------------------------------------------------------------------
       6) При размонтировании => handleStopWatching
    ------------------------------------------------------------------ */
    useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
            console.log('[CamerasTab] unmount => handleStopWatching()');
            handleStopWatching();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ------------------------------------------------------------------
       Рендер
    ------------------------------------------------------------------ */
    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                // Убираем жёсткую высоту, оставляем одинаковые отступы сверху и снизу
                my: 2,
                px: 2,
            }}
        >
            {/* Левая (центральная) область – плеер */}
            <Paper
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                }}
            >
                {selectedCamera ? (
                    mountpointId ? (
                        /* Если идёт просмотр (mountpointId не null) */
                        <>
                            <Typography variant="h6" gutterBottom>
                                Камера: {selectedCamera.name} (mp={mountpointId})
                            </Typography>
                            <JanusPlayer
                                mountpointId={mountpointId}
                                serverUrl={JANUS_WS_URL}
                            />
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleStopWatching}
                                >
                                    Остановить
                                </Button>
                            </Box>
                        </>
                    ) : (
                        /* Камера выбрана, но просмотр не начат */
                        <>
                            <Typography variant="h6" gutterBottom>
                                Камера: {selectedCamera.name}
                            </Typography>
                            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                                Нажмите «Смотреть», чтобы начать просмотр
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => handleStartWatching(selectedCamera)}
                            >
                                Смотреть
                            </Button>
                        </>
                    )
                ) : (
                    /* Если камера не выбрана */
                    <Typography variant="body1" align="center">
                        Выберите камеру из списка справа
                    </Typography>
                )}
            </Paper>

            {/* Правая колонка – список доступных камер */}
            <Paper sx={{ width: 300, p: 2, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                    Доступные камеры
                </Typography>
                {cameras.length === 0 ? (
                    <Typography>Нет доступных камер</Typography>
                ) : (
                    <List>
                        {cameras.map((cam) => (
                            <ListItem
                                key={cam.id}
                                button
                                selected={selectedCamera?.id === cam.id}
                                onClick={() => setSelectedCamera(cam)}
                                sx={{
                                    mb: 1,
                                    borderRadius: 1,
                                    border: '1px solid #ddd',
                                }}
                            >
                                <ListItemText
                                    primary={cam.name}
                                    secondary={`IP: ${cam.ip_address} • Зрители: ${cam.viewers_count}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default CamerasTab;


//
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import Janus from 'janus-gateway';
// import adapter from 'webrtc-adapter';
// import axios from '../../axiosConfig';
// import {
//     Box,
//     Typography,
//     Paper,
//     Button,
//     CircularProgress,
//     Alert,
// } from '@mui/material';
// import JanusPlayer from './JanusPlayer';
//
// const JANUS_WS_URL = 'wss://80.254.125.77/janus_ws/';
// const getJanusDeps = Janus.useDefaultDependencies;
// const janusDeps = getJanusDeps({ adapter });
//
// const CamerasTab = ({ user, setSnackbar }) => {
//     const [loading, setLoading] = useState(false);
//     const [cameras, setCameras] = useState([]);
//     const [error, setError] = useState(null);
//
//     // Инициализация Janus (флаги и версия)
//     const [janusInitialized, setJanusInitialized] = useState(false);
//     const [janusVersion, setJanusVersion] = useState('');
//
//     // Текущая выбранная камера + mountpoint
//     const [selectedCamera, setSelectedCamera] = useState(null);
//     const [mountpointId, setMountpointId] = useState(null);
//
//     // Храним id записи CameraViewingSession, чтобы пинговать / удалять
//     const [cameraViewingSessionId, setCameraViewingSessionId] = useState(null);
//     const pingIntervalRef = useRef(null);
//
//     // Активная Session (наша модель). В реальном коде может быть массив,
//     // либо мы берем только одну (к примеру, последнюю).
//     const [activeSessionId, setActiveSessionId] = useState(null);
//
//     // refs
//     const selectedCameraRef = useRef(null);
//     const isUnmountedRef = useRef(false);
//
//     /* ------------------------------------------------------------------
//        1) Инициализация Janus (один раз)
//     ------------------------------------------------------------------ */
//     useEffect(() => {
//         if (!janusInitialized) {
//             console.log('[CamerasTab] Janus.init()');
//             Janus.init({
//                 debug: 'all',
//                 dependencies: janusDeps,
//                 callback: () => {
//                     console.log('[CamerasTab] Janus init done');
//                     setJanusVersion('1.3.x (manual init)');
//                     setJanusInitialized(true);
//                 },
//             });
//         }
//     }, [janusInitialized]);
//
//     /* ------------------------------------------------------------------
//        2) Загрузка списка камер
//     ------------------------------------------------------------------ */
//     const loadCameras = useCallback(() => {
//         setLoading(true);
//         axios.get('/api/cameras/')
//             .then((res) => {
//                 setCameras(res.data);
//                 setError(null);
//             })
//             .catch((err) => {
//                 console.error('Error fetching cameras:', err);
//                 setError('Не удалось загрузить список камер');
//             })
//             .finally(() => setLoading(false));
//     }, []);
//
//     useEffect(() => {
//         if (user) {
//             loadCameras();
//         }
//     }, [user, loadCameras]);
//
//     /* ------------------------------------------------------------------
//        3) Получаем активную Session (model) для данного пользователя
//           (предполагаем, что у пользователя может быть 1 активная запись).
//     ------------------------------------------------------------------ */
//     const loadActiveSession = useCallback(async () => {
//         try {
//             const resp = await axios.get('/api/sessions/?active=true');
//             if (Array.isArray(resp.data) && resp.data.length > 0) {
//                 // берем, например, первую запись
//                 setActiveSessionId(resp.data[0].id);
//                 console.log('[CamerasTab] loadActiveSession => session_id=', resp.data[0].id);
//             } else {
//                 console.warn('[CamerasTab] No active sessions found for user.');
//                 setActiveSessionId(null);
//             }
//         } catch (err) {
//             console.error('Error loadActiveSession:', err);
//             setActiveSessionId(null);
//         }
//     }, []);
//
//     useEffect(() => {
//         if (user) {
//             loadActiveSession();
//         }
//     }, [user, loadActiveSession]);
//
//     /* ------------------------------------------------------------------
//        4) Начать просмотр камеры
//           - 4.1) start_watching (increments viewers_count)
//           - 4.2) создаём CameraViewingSession
//           - 4.3) запускаем пинг-таймер
//     ------------------------------------------------------------------ */
//     const handleStartWatching = async (camera) => {
//         if (!camera || !activeSessionId) {
//             // либо показывать сообщение, что "нет session_id", либо ...
//             console.warn('No camera or no activeSessionId => skip');
//             return;
//         }
//         try {
//             setSelectedCamera(camera);
//             setMountpointId(null);
//             setCameraViewingSessionId(null);
//
//             // 4.1) start_watching => increment viewer
//             const resp1 = await axios.post(`/api/cameras/${camera.id}/start_watching/`);
//             const mp_id = resp1.data.mountpoint_id;
//             setMountpointId(mp_id);
//
//             // 4.2) POST camera_viewing_sessions => { session_id, camera_id }
//             const cvsResp = await axios.post('/api/camera_viewing_sessions/', {
//                 session_id: activeSessionId,
//                 camera_id: camera.id,
//             });
//             const newCvsId = cvsResp.data.id;
//             setCameraViewingSessionId(newCvsId);
//
//             // 4.3) Запускаем пинг каждые 5 секунд
//             pingIntervalRef.current = window.setInterval(() => {
//                 axios.post(`/api/camera_viewing_sessions/${newCvsId}/ping/`)
//                     .then(() => {
//                         // всё ок
//                     })
//                     .catch(err => {
//                         console.warn('ping_viewing error:', err);
//                     });
//             }, 5_000);
//
//             // обновим список камер (чтобы увидеть viewers_count)
//             loadCameras();
//
//             if (setSnackbar) {
//                 setSnackbar({
//                     open: true,
//                     message: `Начали просмотр: ${camera.name} (mp=${mp_id})`,
//                     severity: 'success',
//                 });
//             }
//         } catch (err) {
//             console.error('Error start_watching or create CameraViewingSession:', err);
//             setMountpointId(null);
//             setSelectedCamera(null);
//             setCameraViewingSessionId(null);
//
//             if (pingIntervalRef.current) {
//                 clearInterval(pingIntervalRef.current);
//                 pingIntervalRef.current = null;
//             }
//
//             if (setSnackbar) {
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при запуске просмотра',
//                     severity: 'error',
//                 });
//             }
//         }
//     };
//
//     /* ------------------------------------------------------------------
//        5) Остановить просмотр (по нажатию кнопки «Остановить»)
//           - 5.1) DELETE camera_viewing_sessions/ID
//           - 5.2) clearInterval
//           - 5.3) stop_watching => decrement_viewer
//     ------------------------------------------------------------------ */
//     const handleStopWatching = useCallback(async () => {
//         if (!selectedCamera) return;
//         const cam = selectedCamera;
//
//         // 5.1) Удаляем CameraViewingSession
//         if (cameraViewingSessionId) {
//             try {
//                 await axios.delete(`/api/camera_viewing_sessions/${cameraViewingSessionId}/`);
//             } catch (delErr) {
//                 console.warn('[CamerasTab] DELETE camera_viewing_sessions failed:', delErr);
//             }
//         }
//         setCameraViewingSessionId(null);
//
//         // 5.2) Очищаем пинг
//         if (pingIntervalRef.current) {
//             clearInterval(pingIntervalRef.current);
//             pingIntervalRef.current = null;
//         }
//
//         // 5.3) stop_watching => decrement_viewer
//         try {
//             await axios.post(`/api/cameras/${cam.id}/stop_watching/`);
//             setMountpointId(null);
//             setSelectedCamera(null);
//             loadCameras();
//
//             if (setSnackbar) {
//                 setSnackbar({
//                     open: true,
//                     message: `Остановили просмотр: ${cam.name}`,
//                     severity: 'info',
//                 });
//             }
//         } catch (err) {
//             console.error('Error stop_watching:', err);
//             setMountpointId(null);
//             setSelectedCamera(null);
//
//             if (setSnackbar) {
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при остановке просмотра',
//                     severity: 'error',
//                 });
//             }
//         }
//     }, [selectedCamera, cameraViewingSessionId, loadCameras, setSnackbar]);
//
//     /* ------------------------------------------------------------------
//        6) При размонтировании (SPA-навигация) => тоже handleStopWatching
//     ------------------------------------------------------------------ */
//     useEffect(() => {
//         return () => {
//             isUnmountedRef.current = true;
//             console.log('[CamerasTab] unmount => handleStopWatching()');
//             handleStopWatching();
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);
//
//     // Обновляем ref
//     useEffect(() => {
//         selectedCameraRef.current = selectedCamera;
//     }, [selectedCamera]);
//
//     /* ------------------------------------------------------------------
//        UI
//     ------------------------------------------------------------------ */
//     if (loading) {
//         return <CircularProgress />;
//     }
//     if (error) {
//         return <Alert severity="error">{error}</Alert>;
//     }
//
//     return (
//         <Box>
//             <Typography variant="h5" gutterBottom>
//                 Список камер
//             </Typography>
//
//             {/*<Typography variant="body2" sx={{ mb: 2 }}>*/}
//             {/*    {janusInitialized*/}
//             {/*        ? `Janus инициализирован, версия: ${janusVersion}`*/}
//             {/*        : 'Инициализация Janus...'}*/}
//             {/*</Typography>*/}
//
//             {/*{activeSessionId ? (*/}
//             {/*    <Typography variant="body2" sx={{ mb: 2 }}>*/}
//             {/*        Наша модельная сессия: ID={activeSessionId}*/}
//             {/*    </Typography>*/}
//             {/*) : (*/}
//             {/*    <Alert severity="warning" sx={{ mb: 2 }}>*/}
//             {/*        Нет активной session (Model).*/}
//             {/*        (Либо пользователь не залогинен, либо нет записи Session.)*/}
//             {/*    </Alert>*/}
//             {/*)}*/}
//
//             {cameras.length === 0 ? (
//                 <Typography>Нет доступных камер</Typography>
//             ) : (
//                 cameras.map((cam) => (
//                     <Paper
//                         key={cam.id}
//                         sx={{
//                             p: 2,
//                             mb: 2,
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                         }}
//                     >
//                         <Box>
//                             <Typography variant="subtitle1">{cam.name}</Typography>
//                             <Typography variant="body2">IP: {cam.ip_address}</Typography>
//                             <Typography variant="body2">Зрители: {cam.viewers_count}</Typography>
//                         </Box>
//
//                         <Button
//                             variant="contained"
//                             onClick={() => handleStartWatching(cam)}
//                             disabled={!!mountpointId && selectedCamera && selectedCamera.id === cam.id}
//                         >
//                             Смотреть
//                         </Button>
//                     </Paper>
//                 ))
//             )}
//
//             {selectedCamera && mountpointId && (
//                 <Box sx={{ mt: 4 }}>
//                     <Typography variant="h6">
//                         Просмотр камеры «{selectedCamera.name}» (mp={mountpointId})
//                     </Typography>
//
//                     <JanusPlayer
//                         mountpointId={mountpointId}
//                         serverUrl={JANUS_WS_URL}
//                     />
//
//                     <Box sx={{ mt: 2 }}>
//                         <Button
//                             variant="outlined"
//                             color="error"
//                             onClick={handleStopWatching}
//                         >
//                             Остановить
//                         </Button>
//                     </Box>
//                 </Box>
//             )}
//         </Box>
//     );
// };
//
// export default CamerasTab;
