// src/components/Dashboard/CamerasTab.js
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';
import axios from '../../axiosConfig';

const CamerasTab = ({ user, departments, setSnackbar }) => {
    const [cameras, setCameras] = useState([]);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [loading, setLoading] = useState(false);

    const wsRef = useRef(null);
    const videoRef = useRef(null);
    const pcRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        axios.get('/api/cameras/')
            .then(response => {
                if (isMounted) {
                    setCameras(response.data);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError('Ошибка при загрузке камер.');
                    console.error("Ошибка при загрузке камер:", err);
                }
            });

        return () => { isMounted = false; };
    }, []);

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
        setSelectedCameraId(null);
        setError(null);
        closeConnections();
    };

    const closeConnections = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const filteredCameras = cameras.filter(cam => {
        if (user.role === 'REGION_HEAD' && selectedDepartment) {
            return cam.department === parseInt(selectedDepartment, 10);
        }
        return true;
    });

    useEffect(() => {
        closeConnections();
        setError(null);
        setLoading(false);

        if (!selectedCameraId) return;

        setLoading(true);

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/camera/${selectedCameraId}/`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established for camera:", selectedCameraId);
            createPeerConnection(ws);
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Received message from server:", data);

                if (data.type === 'answer' && data.sdp && pcRef.current) {
                    await pcRef.current.setRemoteDescription({ type: 'answer', sdp: data.sdp });
                    console.log("Remote description set with SDP answer.");
                } else if (data.type === 'ice-candidate' && data.candidate && pcRef.current) {
                    try {
                        await pcRef.current.addIceCandidate(data.candidate);
                        console.log("ICE candidate added from server.");
                    } catch (e) {
                        console.error('Error adding received ICE candidate', e);
                    }
                } else if (data.type === 'error') {
                    setError(data.message || 'Ошибка при получении потока');
                }
            } catch (e) {
                console.error("Ошибка при разборе сообщения WebSocket:", e);
                setError('Неправильный формат сообщения от сервера.');
            }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            setError('Ошибка при установлении соединения с сервером.');
            setLoading(false);
        };

        ws.onclose = (event) => {
            if (!event.wasClean) {
                console.warn(`WebSocket закрыт некорректно, код: ${event.code}, причина: ${event.reason}`);
                setError('Соединение с сервером прервано.');
            } else {
                console.log("WebSocket closed gracefully.");
            }
            setLoading(false);
        };

        const createPeerConnection = async (wsInstance) => {
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate && wsInstance.readyState === WebSocket.OPEN) {
                    const candidate = event.candidate;
                    wsInstance.send(JSON.stringify({
                        type: 'ice-candidate',
                        candidate: {
                            component: '1',
                            foundation: candidate.foundation || 'unknown',
                            ip: candidate.address || candidate.ip || null,
                            port: candidate.port || 554,
                            priority: candidate.priority || 0,
                            protocol: candidate.protocol || 'tcp',
                            type: candidate.type || 'host',
                            relatedAddress: candidate.relatedAddress || null,
                            relatedPort: candidate.relatedPort || null,
                            sdpMid: candidate.sdpMid || null,
                            sdpMLineIndex: candidate.sdpMLineIndex || null,
                            tcpType: candidate.tcpType || null,
                        },
                    }));
                    console.log("Sent ICE candidate to server.");
                }
            };

            pc.ontrack = (event) => {
                console.log("Received remote track");
                if (videoRef.current) {
                    if (videoRef.current.srcObject !== event.streams[0]) {
                        videoRef.current.srcObject = event.streams[0];
                        console.log("Set remote stream.");
                        setLoading(false);
                    }
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log(`ICE connection state: ${pc.iceConnectionState}`);
                if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
                    setError('Соединение разорвано.');
                    setLoading(false);
                }
            };

            try {
                pc.addTransceiver('video', { direction: 'recvonly' });
                console.log("Added recvonly transceiver for video.");
            } catch (error) {
                console.error("Error adding recvonly transceiver:", error);
                setError('Ошибка при добавлении трансивера.');
                setLoading(false);
                return;
            }

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                wsInstance.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription.sdp }));
                console.log("SDP Offer created and sent.");
            } catch (error) {
                console.error("Error creating or sending offer:", error);
                setError('Ошибка при создании предложения WebRTC.');
                setLoading(false);
            }
        };

        return closeConnections;
    }, [selectedCameraId]);

    const handleCameraClick = (cameraId) => {
        setSelectedCameraId(cameraId);
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Камеры
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {user.role === 'REGION_HEAD' && departments && departments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="department-select-label">Отделение</InputLabel>
                        <Select
                            labelId="department-select-label"
                            value={selectedDepartment}
                            label="Отделение"
                            onChange={handleDepartmentChange}
                        >
                            <MenuItem value="">
                                <em>Все отделения</em>
                            </MenuItem>
                            {departments.map((dep) => (
                                <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ flex: '1 1 300px', overflow: 'auto', maxHeight: '600px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell>IP адрес</TableCell>
                                <TableCell>Активна</TableCell>
                                <TableCell>Отделение</TableCell>
                                <TableCell>Регион</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCameras.map((cam) => (
                                <TableRow
                                    key={cam.id}
                                    hover
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCameraClick(cam.id)}
                                    selected={cam.id === selectedCameraId}
                                >
                                    <TableCell>{cam.name}</TableCell>
                                    <TableCell>{cam.ip_address}</TableCell>
                                    <TableCell>{cam.active ? 'Да' : 'Нет'}</TableCell>
                                    <TableCell>{cam.department_name}</TableCell>
                                    <TableCell>{cam.region_display}</TableCell>
                                </TableRow>
                            ))}
                            {filteredCameras.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Нет доступных камер.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>

                <Box sx={{ flex: '2 1 600px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', position: 'relative' }}>
                    {selectedCameraId ? (
                        <>
                            <video
                                ref={videoRef}
                                controls
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {loading && (
                                <Box sx={{ position: 'absolute' }}>
                                    <CircularProgress />
                                    <Typography variant="body2">Загрузка видеопотока...</Typography>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Typography variant="body1">Выберите камеру для просмотра видеопотока</Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CamerasTab;
