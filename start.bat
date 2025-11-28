:: Script de inicio para Docker Compose y Vite
@echo off
setlocal

:: 1. Levantar los contenedores de Docker en segundo plano
echo.
echo Levantando contenedores Docker (ritmatiza_app, ritmatiza_web, ritmatiza_db)...
docker compose up -d
echo Esperando a que el contenedor PHP se inicialice...
timeout /t 5 /nobreak >nul

:: 2. Establecer permisos de escritura en las carpetas de almacenamiento
echo Ajustando permisos de la carpeta 'storage' en el contenedor...
docker compose exec app chmod -R 777 /var/www/html/storage
docker compose exec app chmod -R 777 /var/www/html/bootstrap/cache
echo Permisos ajustados.

:: 3. Crear enlace simbólico para que los archivos subidos sean accesibles
echo Creando enlace simbólico para storage...
docker compose exec app php artisan storage:link

:: 4. Iniciar el servidor de desarrollo de Vite
echo.
echo Iniciando Vite Dev Server en ./frontend (Ctrl + C para detener)
echo.

:: El comando START /B abre una nueva ventana/sesión de CMD para el proceso de Vite, 
:: permitiendo que ambos procesos (Docker y Vite) se ejecuten en paralelo.
START /B cmd /c "cd frontend && npm run dev"

echo -> Acceso: http://ritmatiza.local

endlocal