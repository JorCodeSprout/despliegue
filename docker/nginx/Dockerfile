# Usamos nginx:stable-alpine como base, ya que es pequeña y rápida.
FROM nginx:stable-alpine

# 1. Instalar herramientas necesarias
RUN apk update && apk add --no-cache shadow

# 2. CREAR el usuario y grupo 'www-data'
# Esto asegura que Nginx y PHP-FPM reconozcan el mismo ID de usuario/grupo.
RUN groupadd -g 82 www-data || true && \
    usermod -a -G www-data nginx

# 3. Copiar la configuración de Nginx de PRODUCCIÓN
# CRÍTICO: Usamos 'nginx-prod.conf' que maneja el enrutamiento SPA y la conexión a PHP-FPM.
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# 4. Copiar los archivos estáticos de la aplicación (incluye el frontend compilado)
# El 'buildCommand' en render.yml ya movió los archivos de React a backend/public.
# Copiamos esa carpeta al web root de Nginx.
COPY backend/public /var/www/html/public

# 5. Establecer permisos
RUN chown -R nginx:nginx /var/www/html/public

# 6. Exponer el puerto
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]