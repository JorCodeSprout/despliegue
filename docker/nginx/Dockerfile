# -------------------- STAGE 1: COMPILACIÓN DE REACT --------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app
# Copia solo los archivos necesarios para la compilación
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copia el resto del código y compila
COPY frontend /app
# Asumo que tu script de build genera la carpeta 'dist' dentro de 'frontend'
RUN npm run build 
# Si tu script genera 'build', cambia 'dist' por 'build'

# -------------------- STAGE 2: SERVIDOR NGINX FINAL --------------------
FROM nginx:stable-alpine

# 1. Instalar herramientas
RUN apk update && apk add --no-cache netcat-openbsd

# 2. Copiar la configuración de Nginx y el Entrypoint
COPY docker/nginx/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# 3. Copiar el Frontend COMPILADO desde la etapa anterior
# CRÍTICO: Copiar los archivos compilados de React a la raíz de Nginx (/usr/share/nginx/html)
COPY --from=frontend_builder /app/dist /var/www/html/public/assets/
# Si React usa rutas absolutas, puede que necesites copiar los archivos principales (index.html) a la raíz:
# COPY --from=frontend_builder /app/dist /var/www/html/public/ 

# 4. Copiar el punto de entrada de Laravel (index.php) y establecer permisos
COPY backend/public/index.php /var/www/html/public/index.php

# Asegurar permisos y directorios
RUN chown -R nginx:nginx /var/www/html/public
RUN mkdir -p /var/log/nginx && chown nginx:nginx /var/log/nginx

# 5. Ejecución
USER nginx
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]