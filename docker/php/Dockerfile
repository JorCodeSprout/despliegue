# Dockerfile para el servicio PHP-FPM (el servicio 'app' en docker-compose/render.yml)

FROM php:8.3-fpm

# 1. Instalar dependencias del sistema y extensiones de PHP
# Se usa 'install -y' para la instalación no interactiva
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
    # Instalar utilidades básicas que pueden ser necesarias para comandos como 'sh'
    # y para garantizar que se reconozca el usuario 'www-data' si es necesario.
    acl \
    sudo \
    # Asegurarse de limpiar el caché de APT para reducir el tamaño de la imagen
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar extensiones de PHP para Laravel y MySQL
# pdo_mysql es esencial para la conexión a la base de datos de Render
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Instalar Composer
# Composer se copia desde una imagen base dedicada para asegurar la última versión
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# 4. Configurar el usuario y el directorio de trabajo
# El usuario de Docker por defecto para las imágenes FPM suele ser 'www-data' (UID 33)
# Configuramos 'root' solo para la instalación, y luego volvemos a 'www-data' para la ejecución
USER root

# El directorio de trabajo que se mapeará al código de Laravel
WORKDIR /var/www/html

# El comando de inicio será manejado por el 'startCommand' en render.yml 
# para ejecutar PHP-FPM y manejar los permisos de Laravel.