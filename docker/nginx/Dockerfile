# -------------------- STAGE 1: COMPILACIÓN DE REACT --------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app
# Copia los archivos necesarios para la compilación
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copia el resto del código y compila
COPY frontend /app
RUN npm run build 
# Asumimos que el build genera la carpeta 'dist' (si usa 'build', ajusta el paso 2)

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
RUN mkdir -p /var/log/nginx && chown nginx:nginx /var/log/nginx

# 5. Ejecución: Iniciar Nginx directamente (eliminamos el entrypoint.sh)
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]