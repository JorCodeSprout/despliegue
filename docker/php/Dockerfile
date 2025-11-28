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

# 5. Copiar el código de la aplicación (el contexto es el root del proyecto)
# NOTA: Solo se copia el backend. El frontend se compila y se mueve a 'public' en el buildCommand del Nginx.
COPY backend /var/www/html

# 6. Instalar dependencias de Laravel y definir el comando de inicio

# Instalar las dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Establecer permisos (esto estaba en tu startCommand original)
# Esto es CRÍTICO para que Laravel pueda escribir en los directorios de cache y logs.
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Comando de inicio del contenedor (CMD), que Render ejecuta por defecto
# ¡Esto reemplaza al startCommand en render.yaml!
CMD ["/usr/local/sbin/php-fpm", "-F"] 

# Opcionalmente, puedes usar tu comando original (si usas la imagen oficial de PHP):
# CMD sh -c "exec docker-php-entrypoint php-fpm"