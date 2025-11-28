#!/bin/sh

# Nombre del host de PHP-FPM y puerto (según el nombre del servicio en el YAML)
HOST_APP="app"
PORT_APP="9000"

echo "➡️ Waiting for the PHP-FPM service at ${HOST_APP}:${PORT_APP}..."

# Bucle para esperar que el puerto 9000 esté disponible
# nc (netcat) -z: modo cero-I/O (solo escaneo), -w 1: tiempo de espera de 1s
until nc -z -w 1 ${HOST_APP} ${PORT_APP}
do
  echo "Host '${HOST_APP}' not responding on port ${PORT_APP}. Retrying in 5 seconds..."
  sleep 5
done

echo "✅ Host '${HOST_APP}:${PORT_APP}' is up. Starting Nginx..."

# Ejecutar el comando principal de Nginx (mantener Nginx en primer plano)
# El 'exec' reemplaza el shell, asegurando que Nginx sea el PID 1
exec nginx -g "daemon off;"