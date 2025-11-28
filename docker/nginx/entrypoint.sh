#!/bin/sh

# Esperar a que el servicio 'app' (PHP-FPM) sea accesible.
echo "Esperando a que el host 'app' sea resoluble en la red interna..."
until ping -c 1 app > /dev/null 2>&1; do
  echo "Host 'app' no encontrado aún. Reintentando en 20 segundos..."
  sleep 20
done

echo "Host 'app' encontrado. Iniciando Nginx..."
# Ejecutar el comando principal de Nginx
exec nginx -g "daemon off;"