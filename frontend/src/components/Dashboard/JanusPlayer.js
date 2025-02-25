// frontend\src\components\Dashboard\JanusPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import Janus from 'janus-gateway';
import adapter from 'webrtc-adapter';

const JanusPlayer = ({ mountpointId, serverUrl }) => {
    const videoRef = useRef(null);
    const pluginHandleRef = useRef(null);

    const [janus, setJanus] = useState(null);

    // Храним общий MediaStream, куда будем складывать треки
    const remoteStreamRef = useRef(null);

    useEffect(() => {
        console.log('[JanusPlayer] useEffect => mountpointId:', mountpointId, ' serverUrl:', serverUrl);

        if (!mountpointId || !serverUrl) {
            console.warn('[JanusPlayer] mountpointId/serverUrl not ready, skip init.');
            return;
        }

        console.log('[JanusPlayer] Creating new Janus instance...');

        // Считаем, что Janus.init() уже сделан в CamerasTab
        const janusInstance = new Janus({
            server: serverUrl,
            apisecret: 'apshubersh',
            iceServers: [
                { urls: 'stun:80.254.125.77:3478' },
                {
                    urls: 'turn:80.254.125.77:3478?transport=udp',
                    username: 'turnuser',
                    credential: 'apshubersh',
                },
            ],
            success: () => {
                console.log('[JanusPlayer] [success] Janus session created successfully');

                // Подключаемся к janus.plugin.streaming
                janusInstance.attach({
                    plugin: 'janus.plugin.streaming',

                    success: (handle) => {
                        console.log('[JanusPlayer] attach -> success! plugin handle =', handle);
                        pluginHandleRef.current = handle;

                        // Отправляем watch
                        const body = {
                            request: 'watch',
                            id: Number(mountpointId),
                        };
                        console.log('[JanusPlayer] => handle.send watch body:', body);
                        handle.send({ message: body });
                    },

                    error: (err) => {
                        console.error('[JanusPlayer] attach error:', err);
                    },

                    onmessage: (msg, jsep) => {
                        console.log('[JanusPlayer] onmessage: msg =', msg, ' jsep=', jsep);
                        const handle = pluginHandleRef.current;
                        if (!handle) {
                            console.warn('[JanusPlayer] onmessage: pluginHandleRef.current is null!');
                            return;
                        }
                        if (jsep) {
                            console.log('[JanusPlayer] onmessage => got JSEP (offer) => createAnswer');
                            handle.createAnswer({
                                jsep,
                                media: {
                                    audioSend: false,
                                    videoSend: false,
                                },
                                success: (jsepAnswer) => {
                                    console.log('[JanusPlayer] createAnswer success => jsepAnswer:', jsepAnswer);

                                    // После createAnswer отправляем запрос 'start'
                                    const startBody = { request: 'start' };
                                    console.log('[JanusPlayer] sending "start" with jsepAnswer...');
                                    handle.send({
                                        message: startBody,
                                        jsep: jsepAnswer,
                                    });
                                },
                                error: (err2) => {
                                    console.error('[JanusPlayer] createAnswer error:', err2);
                                },
                            });
                        }
                    },

                    /**
                     * Вместо onremotestream -> используем onremotetrack
                     * Будем динамически собирать/удалять треки в remoteStream
                     */
                    onremotetrack: (track, mid, flowing) => {
                        console.log('[JanusPlayer] onremotetrack => track:', track, 'mid:', mid, 'flowing:', flowing);

                        // Инициализируем MediaStream, если ещё не сделали
                        if (!remoteStreamRef.current) {
                            remoteStreamRef.current = new MediaStream();
                        }

                        if (flowing) {
                            // Трек появился => добавляем в наш MediaStream
                            try {
                                remoteStreamRef.current.addTrack(track);
                            } catch (err) {
                                console.warn('[JanusPlayer] addTrack failed:', err);
                            }
                        } else {
                            // Трек пропал => убираем
                            try {
                                remoteStreamRef.current.removeTrack(track);
                            } catch (err) {
                                console.warn('[JanusPlayer] removeTrack failed:', err);
                            }
                        }

                        // Назначаем (или очищаем) srcObject
                        if (videoRef.current) {
                            videoRef.current.srcObject = remoteStreamRef.current;
                        }
                    },

                    oncleanup: () => {
                        console.log('[JanusPlayer] oncleanup => plugin cleaned up');
                    },
                });
            },
            error: (err) => {
                console.error('[JanusPlayer] Janus init error:', err);
            },
            destroyed: () => {
                console.log('[JanusPlayer] Janus destroyed (global)');
            },
        });

        setJanus(janusInstance);

        return () => {
            console.log('[JanusPlayer] Unmount => destroy Janus instance + plugin handle');

            // Закрываем handle, если он ещё существует
            if (pluginHandleRef.current) {
                try {
                    console.log('[JanusPlayer] pluginHandleRef.current => hangup & detach');
                    pluginHandleRef.current.hangup();
                    pluginHandleRef.current.detach();
                } catch (detachErr) {
                    console.warn('[JanusPlayer] Error detaching/hanging up:', detachErr);
                }
                pluginHandleRef.current = null;
            }

            // Уничтожаем Janus
            if (janusInstance) {
                console.log('[JanusPlayer] calling janusInstance.destroy()');
                janusInstance.destroy();
            }
            setJanus(null);

            // Сбросим remoteStream
            remoteStreamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [mountpointId, serverUrl]);

    return (
        <div style={{ marginTop: 16 }}>
            <video
                ref={videoRef}
                style={{ width: '100%', maxWidth: 640, backgroundColor: 'black' }}
                autoPlay
                playsInline
                controls={true}
                muted
            />
        </div>
    );
};

export default JanusPlayer;
