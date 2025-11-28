#!/bin/sh

echo "⚙️  Starting Laravel container..."

# 1. Crear el archivo .env a partir de las variables de entorno de Render
# No es estrictamente necesario, pero ayuda a la compatibilidad con algunos comandos.
# Render ya inyecta estas variables, pero esto asegura que Laravel las encuentre.
php /var/www/html/artisan env:encrypt --no-interaction > /dev/null 2>&1

# 2. Ejecutar optimizaciones (config:cache, route:cache)
echo "✨ Caching configuration and routes..."
php /var/www/html/artisan config:cache
php /var/www/html/artisan route:cache

# 3. Ejecutar Migraciones (CRÍTICO para bases de datos externas como Railway)
echo "⏳ Running database migrations..."
php /var/www/html/artisan migrate --force

# 4. Iniciar PHP-FPM (mantenerlo en primer plano)
echo "✅ Starting PHP-FPM on port 9000..."
exec /usr/local/sbin/php-fpm -F