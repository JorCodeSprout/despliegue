FROM php:8.3-fpm

# 1. Instalar dependencias del sistema y extensiones de PHP
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev \
    zip unzip libzip-dev net-tools acl sudo \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# 3. Configurar el directorio de trabajo
USER root
WORKDIR /var/www/html

# 4. Copiar el código de la aplicación (Backend de Laravel)
COPY backend /var/www/html

# 5. Instalar dependencias de Composer (solo install, sin optimizar)
RUN composer install --no-dev

# 6. Crear un script de inicio
COPY docker/php/render-entrypoint.sh /usr/local/bin/render-entrypoint.sh
RUN chmod +x /usr/local/bin/render-entrypoint.sh

# 7. Establecer permisos
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Comando de inicio: Usar el nuevo script que ejecuta las optimizaciones ANTES de PHP-FPM
CMD ["/usr/local/sbin/php-fpm", "-F"]