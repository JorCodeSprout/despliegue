# -----------------------------------------------------------
# ETAPA 1: BUILD STAGE (Compilación del Proyecto React/Vite)
# -----------------------------------------------------------
# Utiliza una imagen de Node.js para instalar dependencias y compilar.
FROM node:20-alpine AS builder 

# Define el directorio de trabajo dentro de este contenedor.
WORKDIR /app

# Copia los archivos de configuración y dependencias del frontend.
# La ruta es relativa a la raíz del repositorio (RITMATIZA).
COPY frontend/package.json frontend/package-lock.json ./ 

# Instala las dependencias.
# --silent reduce el output del build.
RUN npm install --silent

# Copia el resto del código fuente del frontend.
COPY frontend/ ./

# Compila el proyecto React/Vite.
# Vite generalmente crea la carpeta 'dist', pero 'npm run build' lo maneja.
RUN npm run build 
# Asumiendo que el comando 'npm run build' crea una carpeta llamada 'dist' 
# dentro de WORKDIR (/app). Si usa CRA, podría ser 'build'. Ajusta si es necesario.


# -----------------------------------------------------------
# ETAPA 2: PRODUCTION STAGE (Servidor Nginx)
# -----------------------------------------------------------
# Utiliza una imagen de Nginx muy ligera para servir el contenido estático.
FROM nginx:alpine

# Copia la configuración de Nginx personalizada. 
# Esto incluye el proxy_pass crucial hacia el servicio de Laravel.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos COMPILADOS de la etapa 'builder' al directorio de Nginx.
# Origen: /app/dist (Resultado del build de Vite)
# Destino: /usr/share/nginx/html (Directorio raíz por defecto de Nginx)
# Si tu build de React crea una carpeta 'build' en lugar de 'dist', cambia /app/dist por /app/build.
COPY --from=builder /app/dist /usr/share/nginx/html

# Hace que el puerto 80 sea accesible (aunque Railway mapeará 80 a 443 externamente).
EXPOSE 80

# Comando para iniciar Nginx en modo foreground (necesario para Docker).
CMD ["nginx", "-g", "daemon off;"]