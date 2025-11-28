FROM nginx:stable-alpine

# 1. Instalar herramientas necesarias y crear usuario www-data
RUN apk update && apk add --no-cache shadow && \
    groupadd -g 82 www-data || true && \
    usermod -a -G www-data nginx

# 2. Copiar configuración de Nginx y archivos compilados
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf
COPY backend/public /var/www/html/public

# 3. Establecer permisos
RUN chown -R nginx:nginx /var/www/html/public

# 4. Iniciar Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]