// работает, без celery и грузит сильно если несколько пользаков смотрят поток
// // src/components/Dashboard/CamerasTab.js
// import React, { useState, useEffect, useRef } from 'react';
// import {
//     Box,
//     Typography,
//     Alert,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableRow,
//     Paper,
// } from '@mui/material';
// import axios from '../../axiosConfig';
//
// const CamerasTab = ({ user, departments, setSnackbar }) => {
//     const [cameras, setCameras] = useState([]);
//     const [error, setError] = useState(null);
//     const [selectedDepartment, setSelectedDepartment] = useState('');
//     const [selectedCameraId, setSelectedCameraId] = useState(null);
//
//     const wsRef = useRef(null);
//     const videoRef = useRef(null);
//     const pcRef = useRef(null);
//
//     // Загрузка списка камер при монтировании компонента
//     useEffect(() => {
//         let isMounted = true;
//         axios.get('/api/cameras/')
//             .then(response => {
//                 if (isMounted) {
//                     setCameras(response.data);
//                 }
//             })
//             .catch(err => {
//                 if (isMounted) {
//                     setError('Ошибка при загрузке камер.');
//                     console.error("Ошибка при загрузке камер:", err);
//                 }
//             });
//
//         return () => { isMounted = false; };
//     }, []);
//
//     // Обработка изменения отдела
//     const handleDepartmentChange = (event) => {
//         setSelectedDepartment(event.target.value);
//         setSelectedCameraId(null); // Сброс выбранной камеры при изменении отдела
//         setError(null); // Сброс ошибок
//         closeConnections();
//     };
//
//     // Закрытие всех соединений
//     const closeConnections = () => {
//         if (pcRef.current) {
//             pcRef.current.close();
//             pcRef.current = null;
//         }
//         if (wsRef.current) {
//             wsRef.current.close();
//             wsRef.current = null;
//         }
//         if (videoRef.current) {
//             videoRef.current.srcObject = null;
//         }
//     };
//
//     // Фильтрация камер в зависимости от роли пользователя и выбранного отдела
//     const filteredCameras = cameras.filter(cam => {
//         if (user.role === 'REGION_HEAD' && selectedDepartment) {
//             return cam.department === parseInt(selectedDepartment, 10);
//         }
//         return true;
//     });
//
//     // Подключение к WebSocket при выборе камеры
//     useEffect(() => {
//         closeConnections();
//         setError(null); // Сброс ошибок при переключении камеры
//
//         if (!selectedCameraId) return;
//
//         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//         const host = window.location.host;
//         const wsUrl = `${protocol}//${host}/ws/camera/${selectedCameraId}/`;
//
//         const ws = new WebSocket(wsUrl);
//         wsRef.current = ws;
//
//         ws.onopen = () => {
//             console.log("WebSocket connection established for camera:", selectedCameraId);
//             createPeerConnection(ws);
//         };
//
//         ws.onmessage = async (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 console.log("Received message from server:", data);
//
//                 if (data.type === 'answer' && data.sdp) {
//                     await pcRef.current.setRemoteDescription({ type: 'answer', sdp: data.sdp });
//                     console.log("Remote description set with SDP answer.");
//                 } else if (data.type === 'ice-candidate' && data.candidate) {
//                     try {
//                         await pcRef.current.addIceCandidate(data.candidate);
//                         console.log("ICE candidate added from server.");
//                     } catch (e) {
//                         console.error('Error adding received ICE candidate', e);
//                     }
//                 } else if (data.type === 'error') {
//                     setError(data.message || 'Ошибка при получении потока');
//                 }
//             } catch (e) {
//                 console.error("Ошибка при разборе сообщения WebSocket:", e);
//                 setError('Неправильный формат сообщения от сервера.');
//             }
//         };
//
//         ws.onerror = (err) => {
//             console.error("WebSocket error:", err);
//             setError('Ошибка при получении потока.');
//         };
//
//         ws.onclose = (event) => {
//             if (!event.wasClean) {
//                 console.warn(`WebSocket закрыт некорректно, код: ${event.code}, причина: ${event.reason}`);
//                 setError('Соединение с сервером прервано.');
//             } else {
//                 console.log("WebSocket closed gracefully.");
//             }
//         };
//
//         const createPeerConnection = async (wsInstance) => {
//             const pc = new RTCPeerConnection();
//             pcRef.current = pc;
//
//             pc.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     const candidate = event.candidate;
//                     wsInstance.send(JSON.stringify({
//                         type: 'ice-candidate',
//                         candidate: {
//                             component: '1',
//                             foundation: candidate.foundation || 'unknown',
//                             ip: candidate.address || candidate.ip || null, // Используем подходящие поля
//                             port: candidate.port || 554,
//                             priority: candidate.priority || 0,
//                             protocol: candidate.protocol || 'tcp',
//                             type: candidate.type || 'host',
//                             relatedAddress: candidate.relatedAddress || null,
//                             relatedPort: candidate.relatedPort || null,
//                             sdpMid: candidate.sdpMid || null,
//                             sdpMLineIndex: candidate.sdpMLineIndex || null,
//                             tcpType: candidate.tcpType || null,
//                         },
//                     }));
//                     console.log("Sent ICE candidate to server.");
//                 }
//             };
//
//             pc.ontrack = (event) => {
//                 console.log("Received remote track");
//                 if (videoRef.current) {
//                     if (videoRef.current.srcObject !== event.streams[0]) {
//                         videoRef.current.srcObject = event.streams[0];
//                         console.log("Set remote stream.");
//                     }
//                 }
//             };
//
//             pc.oniceconnectionstatechange = () => {
//                 console.log(`ICE connection state: ${pc.iceConnectionState}`);
//                 if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
//                     setError('Соединение разорвано.');
//                 }
//             };
//
//             try {
//                 pc.addTransceiver('video', { direction: 'recvonly' });
//                 console.log("Added recvonly transceiver for video.");
//             } catch (error) {
//                 console.error("Error adding recvonly transceiver:", error);
//                 setError('Ошибка при добавлении трансивера.');
//                 return;
//             }
//
//             try {
//                 const offer = await pc.createOffer();
//                 await pc.setLocalDescription(offer);
//                 wsInstance.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription.sdp }));
//                 console.log("SDP Offer created and sent.");
//             } catch (error) {
//                 console.error("Error creating or sending offer:", error);
//                 setError('Ошибка при создании предложения WebRTC.');
//             }
//         };
//
//         return closeConnections;
//     }, [selectedCameraId]);
//
//     const handleCameraClick = (cameraId) => {
//         setSelectedCameraId(cameraId);
//     };
//
//     return (
//         <Box>
//             <Typography variant="h5" sx={{ mb: 2 }}>
//                 Камеры
//             </Typography>
//
//             {error && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     {error}
//                 </Alert>
//             )}
//
//             {user.role === 'REGION_HEAD' && departments && departments.length > 0 && (
//                 <Box sx={{ mb: 2 }}>
//                     <FormControl size="small" sx={{ minWidth: 200 }}>
//                         <InputLabel id="department-select-label">Отделение</InputLabel>
//                         <Select
//                             labelId="department-select-label"
//                             value={selectedDepartment}
//                             label="Отделение"
//                             onChange={handleDepartmentChange}
//                         >
//                             <MenuItem value="">
//                                 <em>Все отделения</em>
//                             </MenuItem>
//                             {departments.map((dep) => (
//                                 <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}
//
//             <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                 <Paper sx={{ flex: '1 1 300px', overflow: 'auto', maxHeight: '600px' }}>
//                     <Table>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell>Название</TableCell>
//                                 <TableCell>IP адрес</TableCell>
//                                 <TableCell>Активна</TableCell>
//                                 <TableCell>Отделение</TableCell>
//                                 <TableCell>Регион</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {filteredCameras.map((cam) => (
//                                 <TableRow
//                                     key={cam.id}
//                                     hover
//                                     style={{ cursor: 'pointer' }}
//                                     onClick={() => handleCameraClick(cam.id)}
//                                     selected={cam.id === selectedCameraId}
//                                 >
//                                     <TableCell>{cam.name}</TableCell>
//                                     <TableCell>{cam.ip_address}</TableCell>
//                                     <TableCell>{cam.active ? 'Да' : 'Нет'}</TableCell>
//                                     <TableCell>{cam.department_name}</TableCell>
//                                     <TableCell>{cam.region_display}</TableCell>
//                                 </TableRow>
//                             ))}
//                             {filteredCameras.length === 0 && (
//                                 <TableRow>
//                                     <TableCell colSpan={5} align="center">
//                                         Нет доступных камер.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </Paper>
//
//                 <Box sx={{ flex: '2 1 600px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
//                     {selectedCameraId ? (
//                         <video
//                             ref={videoRef}
//                             controls
//                             autoPlay
//                             playsInline
//                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         />
//                     ) : (
//                         <Typography variant="body1">Выберите камеру для просмотра видеопотока</Typography>
//                     )}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };
//
// export default CamerasTab;
//
//
//
//
// // ---------------для HLS ------------------------
// // // src/components/Dashboard/CamerasTab.js
// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //     Box,
// //     Typography,
// //     Alert,
// //     FormControl,
// //     InputLabel,
// //     Select,
// //     MenuItem,
// //     Table,
// //     TableBody,
// //     TableCell,
// //     TableHead,
// //     TableRow,
// //     Paper,
// // } from '@mui/material';
// // import axios from '../../axiosConfig';
// // import Hls from 'hls.js';
// //
// // const CamerasTab = ({ user, departments, setSnackbar }) => {
// //     const [cameras, setCameras] = useState([]);
// //     const [error, setError] = useState(null);
// //     const [selectedDepartment, setSelectedDepartment] = useState('');
// //     const [selectedCameraId, setSelectedCameraId] = useState(null);
// //     const [playlistUrl, setPlaylistUrl] = useState(null);
// //
// //     const wsRef = useRef(null);
// //     const videoRef = useRef(null);
// //     const hlsRef = useRef(null);
// //
// //     // Загрузка списка камер при монтировании компонента
// //     useEffect(() => {
// //         let isMounted = true;
// //         axios.get('/api/cameras/')
// //             .then(response => {
// //                 if (isMounted) {
// //                     setCameras(response.data);
// //                 }
// //             })
// //             .catch(err => {
// //                 if (isMounted) {
// //                     setError('Ошибка при загрузке камер.');
// //                     console.error("Ошибка при загрузке камер:", err);
// //                 }
// //             });
// //
// //         return () => { isMounted = false; };
// //     }, []);
// //
// //     // Обработка изменения отдела
// //     const handleDepartmentChange = (event) => {
// //         setSelectedDepartment(event.target.value);
// //         setSelectedCameraId(null); // Сброс выбранной камеры при изменении отдела
// //         setPlaylistUrl(null); // Сброс плейлиста
// //         setError(null); // Сброс ошибок
// //     };
// //
// //     // Фильтрация камер в зависимости от роли пользователя и выбранного отдела
// //     const filteredCameras = cameras.filter(cam => {
// //         if (user.role === 'REGION_HEAD' && selectedDepartment) {
// //             return cam.department === parseInt(selectedDepartment, 10);
// //         }
// //         return true;
// //     });
// //
// //     // Подключение к WebSocket при выборе камеры
// //     useEffect(() => {
// //         // Закрытие предыдущего соединения WebSocket при смене камеры
// //         if (wsRef.current) {
// //             wsRef.current.close();
// //             wsRef.current = null;
// //         }
// //         setPlaylistUrl(null);
// //         setError(null); // Сброс ошибок при переключении камеры
// //
// //         if (!selectedCameraId) return;
// //
// //         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// //         const host = window.location.host;
// //         const wsUrl = `${protocol}//${host}/ws/camera/${selectedCameraId}/`;
// //
// //         const ws = new WebSocket(wsUrl);
// //         wsRef.current = ws;
// //
// //         ws.onopen = () => {
// //             console.log("WebSocket connection established for camera:", selectedCameraId);
// //         };
// //
// //         ws.onmessage = (event) => {
// //             try {
// //                 const data = JSON.parse(event.data);
// //                 if (data.type === 'playlist' && data.url) {
// //                     setPlaylistUrl(data.url);
// //                 } else if (data.type === 'error') {
// //                     setError(data.message || 'Ошибка при получении потока');
// //                 }
// //             } catch (e) {
// //                 console.error("Ошибка при разборе сообщения WebSocket:", e);
// //                 setError('Неправильный формат сообщения от сервера.');
// //             }
// //         };
// //
// //         ws.onerror = (err) => {
// //             console.error("WebSocket error:", err);
// //             setError('Ошибка при получении потока.');
// //         };
// //
// //         ws.onclose = (event) => {
// //             if (!event.wasClean) {
// //                 console.warn(`WebSocket закрыт некорректно, код: ${event.code}, причина: ${event.reason}`);
// //                 setError('Соединение с сервером прервано.');
// //             } else {
// //                 console.log("WebSocket closed gracefully.");
// //             }
// //         };
// //
// //         // Очистка при размонтировании или изменении камеры
// //         return () => {
// //             if (wsRef.current) {
// //                 wsRef.current.close();
// //             }
// //             wsRef.current = null;
// //         };
// //     }, [selectedCameraId]);
// //
// //     // Инициализация Hls.js при получении URL плейлиста
// //     useEffect(() => {
// //         // Очистка предыдущего экземпляра Hls.js
// //         if (hlsRef.current) {
// //             hlsRef.current.destroy();
// //             hlsRef.current = null;
// //         }
// //
// //         if (playlistUrl && videoRef.current) {
// //             if (Hls.isSupported()) {
// //                 const hls = new Hls({
// //                     debug: false, // Включите true для отладки
// //                     maxBufferLength: 60, // Увеличено до 60 секунд
// //                     maxMaxBufferLength: 120, // Увеличено до 120 секунд
// //                     maxBufferSize: 120 * 1000 * 1000, // Увеличено до 120MB
// //                     liveSyncDuration: 20, // Увеличено до 20 секунд
// //                     liveMaxLatencyDuration: 40, // Увеличено до 40 секунд
// //                     lowLatencyMode: false, // Отключено для большего буфера
// //                     enableWorker: true, // Использование веб-воркера
// //                     capLevelToPlayerSize: true, // Ограничение уровня качества по размеру плеера
// //                     backBufferLength: 120, // Увеличено до 120 секунд
// //                     fastSwitch: true, // Быстрое переключение между уровнями качества
// //                 });
// //                 hlsRef.current = hls;
// //                 hls.loadSource(playlistUrl);
// //                 hls.attachMedia(videoRef.current);
// //
// //                 hls.on(Hls.Events.MANIFEST_PARSED, function() {
// //                     console.log("HLS Manifest parsed, starting playback...");
// //                     videoRef.current.play().catch(err => {
// //                         console.error("Ошибка при воспроизведении видео:", err);
// //                         setError('Не удалось начать воспроизведение видео.');
// //                     });
// //                 });
// //
// //                 // Логирование загруженных фрагментов
// //                 hls.on(Hls.Events.FRAG_LOADED, function(event, data) {
// //                     console.log(`Сегмент загружен: ${data.frag.sn}`);
// //                 });
// //
// //                 // Логирование добавления фрагментов в буфер
// //                 hls.on(Hls.Events.BUFFER_APPENDING, function(event, data) {
// //                     console.log(`Добавление фрагмента в буфер: ${data.frag.sn}`);
// //                 });
// //
// //                 // Обработка переключений фрагментов
// //                 hls.on(Hls.Events.FRAG_CHANGED, function(event, data) {
// //                     console.log(`Переход к сегменту: ${data.frag.sn}`);
// //                 });
// //
// //                 // Обработка ошибок Hls.js
// //                 hls.on(Hls.Events.ERROR, function(event, data) {
// //                     if (data.fatal) {
// //                         switch(data.type) {
// //                             case Hls.ErrorTypes.NETWORK_ERROR:
// //                                 console.error("Фатальная сетевая ошибка, пытаемся восстановить...");
// //                                 hls.startLoad();
// //                                 break;
// //                             case Hls.ErrorTypes.MEDIA_ERROR:
// //                                 console.error("Фатальная медиа ошибка, пытаемся восстановить...");
// //                                 hls.recoverMediaError();
// //                                 break;
// //                             default:
// //                                 hls.destroy();
// //                                 setError('Ошибка при воспроизведении потока HLS.');
// //                                 break;
// //                         }
// //                     } else {
// //                         console.warn("Нефатальная ошибка:", data);
// //                     }
// //                 });
// //
// //                 // Обработка ошибок загрузки сегментов
// //                 hls.on(Hls.Events.LOAD_ERROR, function(event, data) {
// //                     console.error("Ошибка загрузки сегмента HLS:", data);
// //                     setError('Ошибка загрузки сегмента HLS.');
// //                 });
// //
// //                 // Начало загрузки
// //                 hls.on(Hls.Events.MEDIA_ATTACHED, function() {
// //                     hls.startLoad(); // Начинаем загрузку
// //                 });
// //             } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
// //                 // Поддержка native HLS (Safari, iOS)
// //                 videoRef.current.src = playlistUrl;
// //                 videoRef.current.play().catch(err => {
// //                     console.error("Ошибка при воспроизведении native HLS:", err);
// //                     setError('Не удалось воспроизвести поток HLS.');
// //                 });
// //             } else {
// //                 setError('Ваш браузер не поддерживает HLS.');
// //             }
// //         }
// //
// //         // Очистка при размонтировании или изменении плейлиста
// //         return () => {
// //             if (hlsRef.current) {
// //                 hlsRef.current.destroy();
// //                 hlsRef.current = null;
// //             }
// //         };
// //     }, [playlistUrl]);
// //
// //     // Обработка клика по камере
// //     const handleCameraClick = (cameraId) => {
// //         setSelectedCameraId(cameraId);
// //     };
// //
// //     return (
// //         <Box>
// //             <Typography variant="h5" sx={{ mb: 2 }}>
// //                 Камеры
// //             </Typography>
// //
// //             {error && (
// //                 <Alert severity="error" sx={{ mb: 2 }}>
// //                     {error}
// //                 </Alert>
// //             )}
// //
// //             {user.role === 'REGION_HEAD' && departments && departments.length > 0 && (
// //                 <Box sx={{ mb: 2 }}>
// //                     <FormControl size="small" sx={{ minWidth: 200 }}>
// //                         <InputLabel id="department-select-label">Отделение</InputLabel>
// //                         <Select
// //                             labelId="department-select-label"
// //                             value={selectedDepartment}
// //                             label="Отделение"
// //                             onChange={handleDepartmentChange}
// //                         >
// //                             <MenuItem value="">
// //                                 <em>Все отделения</em>
// //                             </MenuItem>
// //                             {departments.map((dep) => (
// //                                 <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
// //                             ))}
// //                         </Select>
// //                     </FormControl>
// //                 </Box>
// //             )}
// //
// //             <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
// //                 <Paper sx={{ flex: '1 1 300px', overflow: 'auto', maxHeight: '600px' }}>
// //                     <Table>
// //                         <TableHead>
// //                             <TableRow>
// //                                 <TableCell>Название</TableCell>
// //                                 <TableCell>IP адрес</TableCell>
// //                                 <TableCell>Активна</TableCell>
// //                                 <TableCell>Отделение</TableCell>
// //                                 <TableCell>Регион</TableCell>
// //                             </TableRow>
// //                         </TableHead>
// //                         <TableBody>
// //                             {filteredCameras.map((cam) => (
// //                                 <TableRow
// //                                     key={cam.id}
// //                                     hover
// //                                     style={{ cursor: 'pointer' }}
// //                                     onClick={() => handleCameraClick(cam.id)}
// //                                     selected={cam.id === selectedCameraId}
// //                                 >
// //                                     <TableCell>{cam.name}</TableCell>
// //                                     <TableCell>{cam.ip_address}</TableCell>
// //                                     <TableCell>{cam.active ? 'Да' : 'Нет'}</TableCell>
// //                                     <TableCell>{cam.department_name}</TableCell>
// //                                     <TableCell>{cam.region_display}</TableCell>
// //                                 </TableRow>
// //                             ))}
// //                             {filteredCameras.length === 0 && (
// //                                 <TableRow>
// //                                     <TableCell colSpan={5} align="center">
// //                                         Нет доступных камер.
// //                                     </TableCell>
// //                                 </TableRow>
// //                             )}
// //                         </TableBody>
// //                     </Table>
// //                 </Paper>
// //
// //                 {/* Блок для отображения видеопотока через HLS */}
// //                 <Box sx={{ flex: '2 1 600px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
// //                     {selectedCameraId && playlistUrl ? (
// //                         <video
// //                             ref={videoRef}
// //                             controls
// //                             preload="auto"
// //                             autoPlay
// //                             playsInline
// //                             muted
// //                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
// //                         />
// //                     ) : (
// //                         <Typography variant="body1">Выберите камеру для просмотра видеопотока</Typography>
// //                     )}
// //                 </Box>
// //             </Box>
// //         </Box>
// //     );
// //
// // };
// //
// // export default CamerasTab;
// // ---------------для HLS ------------------------