FROM php:8.3-fpm

# 1. Instalar dependencias del sistema y extensiones de PHP
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev \
    zip unzip libzip-dev net-tools acl sudo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar extensiones de PHP para Laravel y MySQL
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# 4. Configurar el directorio de trabajo
USER root
WORKDIR /var/www/html

# 5. Copiar el código de la aplicación (Backend de Laravel)
COPY backend /var/www/html

# 6. Instalar dependencias de Composer (solo las dependencias, sin optimizaciones)
RUN composer install --no-dev

# 7. Crear un script de inicio para manejar las optimizaciones y migraciones
COPY docker/php/entrypoint.sh /usr/local/bin/render-entrypoint.sh
RUN chmod +x /usr/local/bin/render-entrypoint.sh

# 8. Establecer permisos CRÍTICOS para Laravel
# Se recomienda usar el usuario 'www-data' si es posible, pero 777 funciona para el inicio rápido
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Comando de inicio: Usar el nuevo script que ejecuta las optimizaciones ANTES de PHP-FPM
CMD ["/usr/local/bin/render-entrypoint.sh"]