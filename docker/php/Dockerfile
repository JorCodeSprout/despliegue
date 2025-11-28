FROM php:8.3-fpm

# 1. Instalar dependencias del sistema y extensiones de PHP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    net-tools \
    acl \
    sudo \
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

# 6. Instalar dependencias de Laravel y definir el comando de inicio

# Instalar las dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Establecer permisos CRÍTICOS para Laravel
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Comando de inicio del contenedor (Inicia PHP-FPM en el puerto 9000 por defecto)
CMD ["/usr/local/sbin/php-fpm", "-F"]