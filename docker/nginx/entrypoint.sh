#!/bin/sh

# Nombre del host de PHP-FPM (según el nombre del servicio en el YAML)
HOST_APP="app"

echo "➡️ Waiting for the PHP-FPM service host resolution: ${HOST_APP}..."

# Bucle para esperar que el host 'app' sea resoluble mediante ping.
# Esto asegura que el Service Discovery de la plataforma haya registrado 'app'.
until ping -c 1 ${HOST_APP} &> /dev/null
do
  echo "Host '${HOST_APP}' not found yet. Retrying in 5 seconds..."
  sleep 5
done

echo "✅ Host '${HOST_APP}' resolved. Starting Nginx..."

# Ejecutar el comando principal de Nginx (mantener Nginx en primer plano)
# El 'exec' reemplaza el shell, asegurando que Nginx sea el PID 1
exec nginx -g "daemon off;"