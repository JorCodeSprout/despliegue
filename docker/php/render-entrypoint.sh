#!/bin/sh

echo "⚙️  Starting Laravel container setup..."

# 1. Esperar a que la base de datos externa (Railway) esté disponible
echo "⏳ Waiting for DB to be ready..."
sleep 15 

# 2. Ejecutar optimizaciones
echo "✨ Caching configuration and routes..."
php /var/www/html/artisan config:cache
php /var/www/html/artisan route:cache

# 3. Ejecutar Migraciones 
echo "⏳ Running database migrations..."
php /var/www/html/artisan migrate --force

# *** NOTA: El inicio de PHP-FPM ha sido removido ***
# Una vez aquí, el script TERMINA (exit 0)