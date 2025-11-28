<?php

/*
 * Este código se encarga de mapear toda la aplicación a excepción de un par de rutas de las que se encargará el archivo
 * <<web.php>>. Esta es la manera que tendrá la parte frontend de la aplicación para comunicarse con el backend utilizando
 * las promesas de JS.
 */

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MusicaController;
use App\Http\Controllers\SpotifyAuthController;
use App\Http\Controllers\SpotifyTokenController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function () {
    Route::post('register', 'register')->name('register');
    Route::post('login', 'login')->name('login');
});

Route::get('tareas/ultimas', [TareaController::class, 'ultimasTareas']);
Route::get('tareas/profesor/{profesorId}', [TareaController::class, 'getTareasByProfesor']);
Route::get('spotify_token', [SpotifyTokenController::class, 'getSpotifyToken']);
Route::post("contacto", [ContactController::class, "send"]);
Route::get('spotify/callback', [SpotifyAuthController::class, 'callback']);


Route::middleware('auth:api')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::post('logout', 'logout');
        Route::post('refresh', 'refresh');
    });

    Route::controller(UserController::class)->group(function() {
        Route::get('me', 'me');
        Route::put('usuario/update', 'update');
        Route::get('usuario/profesor', 'obtenerProfesor');
    });

    Route::controller(TareaController::class)->prefix('/tareas')->group(function () {
        // Listar todas
        Route::get('/', 'index');
        // Entregar
        Route::post('{tarea}/entregar', 'subirEntrega');
        // Ver mis entregas
        Route::get('mis-entregas', 'misEntregas');
    });

    Route::controller(MusicaController::class)->prefix('/musica')->group(function () {
        Route::get('playlist', 'getPlaylist');
        Route::post('sugerir', 'sugerirCancion');
        Route::get('buscar', 'buscarSpotify');

        // Ruta para ver TODAS las sugerencias
        Route::get('sugerencias', 'listado');
    });

    Route::middleware('can:profesor-or-admin')->group(function () {
        Route::controller(TareaController::class)->prefix('/tareas')->group(function () {
            // Crear tarea
            Route::post('crear', 'store');
            // Ver entregas
            Route::get('{profesor_id}/entregas', 'entregasPorTarea');

        });

        // Calificar tarea
        Route::post('entregas/{entrega}/calificar', [TareaController::class, 'calificarEntrega']);

        Route::controller(UserController::class)->prefix("/usuario")->group(function () {
            Route::get("/all", "obtenerUsuarios");
            Route::put("{usuario}/cambiar", "actualizarUsuario");
        });
    });

    Route::middleware('can:admin-only')->group(function () {
        Route::controller(SpotifyAuthController::class)->prefix('/spotify')->group(function () {
            Route::post('redirect', 'redirect');
        });

        Route::controller(MusicaController::class)->prefix('/musica')->group(function () {
            // 1. Aceptar Sugerencia (Añadir a playlist)
            Route::post('sugerencias/{sugerencia}/add', 'anadirPlaylist');

            // 2. Eliminar canción de playlist (Eliminacion fisica)
            Route::delete('playlist/{cancion}/eliminar', 'eliminarCancionPlaylist');

            // 3. Cancelar Sugerencia (Cambiar estado a CANCELADA)
            Route::patch('sugerencias/{sugerencia}/cancelar', 'cancelarCancion');
            Route::patch('playlist/{cancion}/reproducida', 'marcarComoReproducida');
        });

        Route::controller(UserController::class)->prefix('/usuario')->group(function () {
            Route::post('/crear', 'crear');
            Route::get('/profesores', 'obtenerProfesores');
        });
    });
});
