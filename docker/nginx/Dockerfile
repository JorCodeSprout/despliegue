# -------------------- STAGE 1: COMPILACIÓN DE REACT --------------------
# Usamos node:20-alpine para un contenedor de compilación ligero
FROM node:20-alpine AS frontend_builder

WORKDIR /app

# Copia los archivos de gestión de dependencias
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copia el resto del código del frontend
COPY frontend /app

# Usar 'ARG' y pasar la variable de Render al entorno de compilación
ARG VITE_API_URL

# CRÍTICO: Asegurarse de que el valor VITE_API_URL se pase al npm run build
ENV VITE_API_URL=$VITE_API_URL

# Ejecuta la compilación del frontend
RUN npm run build

# -------------------- STAGE 2: SERVIDOR NGINX FINAL --------------------
# Usamos nginx:stable-alpine para el servidor de producción
FROM nginx:stable-alpine

# 1. Instalar herramientas de diagnóstico (net-tools)
RUN apk update && apk add --no-cache net-tools

# 2. Copiar la configuración de Nginx
# CRÍTICO: Copiar el archivo de configuración principal de Nginx modificado.
# Este archivo debe contener 'pid /var/run/nginx/nginx.pid;' en el nivel global.
COPY docker/nginx/nginx-main.conf /etc/nginx/nginx.conf

# Copiar la configuración del servidor virtual (fastcgi_pass, try_files, etc.)
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# 3. Copiar el Frontend COMPILADO desde la etapa anterior
COPY --from=frontend_builder /app/dist /var/www/html/public/

# 4. Asegurarse de que el punto de entrada de Laravel exista (para el fastcgi_pass)
COPY backend/public/index.php /var/www/html/public/index.php

# 5. Corrección de Permisos Final
# Se crea /var/run/nginx, /var/cache/nginx y se asigna propiedad al usuario nginx
RUN mkdir -p /var/cache/nginx/client_temp /var/run/nginx \
    && chown -R nginx:nginx /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/www/html/public \
    && chown -R nginx:nginx /var/log/nginx

# 6. Ejecución: Iniciar Nginx
# Usar el usuario de bajo privilegio
USER nginx
EXPOSE 80
# CMD simple: la ruta PID ya está configurada en nginx.conf
CMD ["nginx", "-g", "daemon off;"]