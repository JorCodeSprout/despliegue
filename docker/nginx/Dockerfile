FROM nginx:stable-alpine

# 1. Instalar herramientas necesarias (incluyendo ping) y crear usuario www-data
RUN apk update && apk add --no-cache shadow iputils && \
    groupadd -g 82 www-data || true && \
    usermod -a -G www-data nginx

# NUEVO: Copiar el script de entrada y darle permisos de ejecución
COPY docker/nginx/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# 2. Copiar configuración de Nginx
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# CRÍTICO: Asegurarse de que el punto de entrada de Laravel existe
COPY backend/public/index.php /var/www/html/public/index.php
RUN mkdir -p /var/www/html/public/assets # Directorio para el frontend compilado

# 3. Establecer permisos
RUN chown -R nginx:nginx /var/www/html/public

# 4. Usar el script de espera como punto de entrada
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]