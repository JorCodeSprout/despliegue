# -------------------- STAGE 1: COMPILACIÓN DE FRONTEND --------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app

# Copia los archivos de gestión de dependencias
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copia el resto del código del frontend
COPY frontend /app

# Ejecuta la compilación del frontend
RUN npm run build 
# Asumiendo que npm run build genera el SPA compilado en /app/dist

# -------------------- STAGE 2: SERVIDOR NGINX FINAL --------------------
FROM nginx:stable-alpine

# 1. Instalar herramientas de diagnóstico (net-tools)
RUN apk update && apk add --no-cache net-tools

# 2. Copiar la configuración de Nginx
COPY docker/nginx/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx/nginx-prod.conf /etc/nginx/conf.d/default.conf

# 3. Copiar el Frontend COMPILADO: ¡VA A LA RAÍZ ESTÁTICA POR DEFECTO!
# Esto asegura que index.html sea el primer archivo que Nginx busque.
COPY --from=frontend_builder /app/dist /usr/share/nginx/html 

# 5. Corrección de Permisos
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx

# 6. Ejecución: Iniciar Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]