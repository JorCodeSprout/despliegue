# ETAPA 1: BUILD STAGE (Compilación de React)
# Usamos una imagen de Node.js ligera para la compilación.
FROM node:20-alpine AS builder 

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración (package.json, etc.) del frontend
# Nota: La ruta es relativa al directorio raíz (RITMATIZA) donde se coloca el Dockerfile.
COPY frontend/package.json frontend/package-lock.json ./ 

# Instala las dependencias. Si no hay cambios en package.json, se cachea esta capa.
RUN npm install

# Copia el resto del código del frontend
COPY frontend/ ./

# **IMPORTANTE**
# Las variables de entorno de React deben comenzar con REACT_APP_ (o VITE_, si usas Vite).
# El compilador de React (o Vite) necesita que estas variables estén presentes *en el momento del build*.
# Puedes pasarlas como ARG (argumento de construcción)
ARG VITE_API_URL 
ENV VITE_API_URL=$VITE_API_URL

# Ejecuta el comando de compilación de React (genera la carpeta 'build' o 'dist')
RUN npm run build