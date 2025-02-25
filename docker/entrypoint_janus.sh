# docker/entrypoint_janus.sh
#!/bin/bash
set -e

# Убедитесь, что в образе есть netcat (nc). Если нет, нужно установить:
# RUN apt-get update && apt-get install -y netcat

echo "[entrypoint_janus.sh] Checking coturn availability..."

# Ждём, пока coturn:3478 откроется (чтобы Janus не упал с 'No response to our STUN BINDING')
until nc -zv coturn 3478; do
    echo "[entrypoint_janus.sh] Waiting for coturn (hostname: 'coturn', port: 3478)..."
    sleep 2
done

echo "[entrypoint_janus.sh] Coturn is up, starting Janus now."
janus

# Если у вас есть другие команды, они выполнятся ниже
exec "$@"