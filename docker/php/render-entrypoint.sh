#!/bin/sh

echo "⚙️  Starting Laravel container..."

# 1. Esperar a que la base de datos externa (Railway) esté disponible
echo "⏳ Waiting for Railway DB to be ready..."
# Usamos un simple bucle ya que no tenemos 'nc' en la base Alpine, o podemos usar el host real
sleep 15 # Damos 15 segundos a Railway para que esté disponible

# 2. Ejecutar optimizaciones (APP_KEY ya está disponible via Render ENV Vars)
echo "✨ Caching configuration and routes..."
php /var/www/html/artisan config:cache
php /var/www/html/artisan route:cache

# 3. Ejecutar Migraciones 
echo "⏳ Running database migrations..."
php /var/www/html/artisan migrate --force

# 4. Iniciar PHP-FPM (mantenerlo en primer plano)
echo "✅ Starting PHP-FPM on port 9000..."
exec /usr/local/sbin/php-fpm -F