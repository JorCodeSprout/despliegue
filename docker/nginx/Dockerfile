# -------------------- STAGE 1: COMPILACIÓN DE REACT --------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app
# Copia los archivos necesarios para la compilación
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copia el resto del código
COPY frontend /app

# Usar 'ARG' y pasar la variable de Render al entorno de compilación
ARG VITE_API_URL

# CRÍTICO: Asegurarse de que el valor VITE_API_URL se pase al npm run build
# Usamos ENV para que esté disponible en el shell de compilación
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# -------------------- STAGE 2: SERVIDOR NGINX FINAL --------------------
FROM nginx:stable-alpine

# 1. Instalar herramientas
# netcat ya no es necesario aquí, pero net-tools puede ser útil para diagnóstico
RUN apk update && apk add --no-cache net-tools

# 2. Copiar la configuración de Nginx
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# 3. Copiar el Frontend COMPILADO desde la etapa anterior
# CRÍTICO: Copiar a la carpeta 'public' de Laravel, que es el root de Nginx
COPY --from=frontend_builder /app/dist /var/www/html/public/

# 4. Asegurarse de que el punto de entrada de Laravel exista
COPY backend/public/index.php /var/www/html/public/index.php

RUN mkdir -p /var/cache/nginx/client_temp /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run/nginx \
    && chown -R nginx:nginx /var/www/html/public \
    && chown -R nginx:nginx /var/log/nginx

# 5. Ejecución: Iniciar Nginx directamente (eliminamos el entrypoint.sh)
USER nginx
EXPOSE 80
CMD nginx -g 'daemon off;' -p /var/run/nginx/