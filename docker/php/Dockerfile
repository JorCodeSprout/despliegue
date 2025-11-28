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
    libpq-dev \
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