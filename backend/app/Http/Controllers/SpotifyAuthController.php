<?php

/*
 * SpotifyAuthController
 * ==============================
 * Este controlador será el encargado de gestionar el flujo de autenticación del administrador con la API de Spotify.
 * El objetivo principal es obtener y almacenar de forma segura los AccessToken y RefreshToken necesarios para que
 * el backend pueda interactuar con la API en nombre del administrador.
 * Es necesario para gestionar la playlist, tanto para añadir como para eliminar canciones y solo los usuarios Admin
 * tendrán acceso a estos endpoints
 */
namespace App\Http\Controllers;


use App\Models\User;
use App\Services\SpotifyApiService;
use Auth;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SpotifyAuthController extends Controller
{
    protected SpotifyApiService $spotifyService;
    private const CACHE_KEY_PREFIX = 'spotify_admin_tokens_';
    private const CACHE_STATE_PREFIX = 'spotify_auth_state_';

    public function __construct(SpotifyApiService $spotifyService)
    {
        $this->spotifyService = $spotifyService;
    }

    /*
     * redirect
     * ==============
     * Se encarga de verificar el usuario para confirmar que sea Admin. Genera un parámetro state aleatorio para prevenir
     * los ataques CSRF y lo almacena en caché. Define los permisos necesarios como playlist-modify-public y construye
     * y devuelve la URL de autorización de Spotify a la que el frontend debe redirigir al usuario.
     *
     * Devuelve un objeto JSON con la URL de autenticación.
     */
    public function redirect(Request $request)
    {
        $user = auth()->user();
        if (Gate::denies('admin-only', $user)) {
            return response()->json(['error' => 'Acceso no autorizado. Se requiere rol de Admin.'], 403);
        }

        $state = Str::random(40);
        $userState = $user->id . '|' . $state;

        // Almacenar el estado en la sesión para validación posterior
        $cacheState = self::CACHE_STATE_PREFIX . $user->id;
        // Se guarda en la caché por 5min
        Cache::put($cacheState, $state, 300);

        // Definimos los permisos necesarios
        $scope = 'playlist-modify-public user-read-private';

        $authUrl = $this->spotifyService->getAuthUrl($scope, $userState);

        return response()->json([
            'auth_url' => $authUrl
        ]);
    }

    /*
     * callback
     * ==============
     * Este método se encargará de que Spotify verifique el rol de Admin y compruebe la validez del parámetro state. Una
     * vez hecho esto recibe el código de autorización de Spotify y lo intercambia con los token de acceso y refresh usando
     * el SpotifyApiService. Los almacena de forma segura y persistente en la caché para poder utilizarlos posteriormente.
     *
     * Devuelve un mensaje de error detallado si falla o un mensaje de éxito para confirmar que se hayan almacenado
     * correctamente.
     */
    public function callback(Request $request)
    {
        $requestStateFull = $request->input('state');

        if(empty($requestStateFull) || !Str::contains($requestStateFull, '|')) {
            Log::error("Spotify Auth: State inválido o incompleto");
            return response()->json([
                'error' => 'Falló la verificación de seguridad (STATE inválido'
            ], 400);
        }

        [$userId, $requestState] = explode('|', $requestStateFull, 2);

        $user = User::find($userId);

        if(!$user) {
            Log::error("Spotify Auth: Usuario no encontrado con ID: " . $userId);
            return response()->json([
                'error' => 'Usuarios no encontrado'
            ], 404);
        }

        $cacheStateKey = self::CACHE_STATE_PREFIX . $user->id;
        $sessionState = Cache::pull($cacheStateKey);

        if(!$requestState ||$requestState !== $sessionState) {
            Log::error("Spotify Auth Error: " . $request->input('error'));
            return response()->json([
                'error' => 'La autorización de Spotify ha fallado'
            ], 400);
        }

        $code = $request->input('code');

        if(!$code) {
            return response()->json([
                'error' => 'Falta el código de autorización'
            ], 400);
        }

        try {
            $tokens = $this->spotifyService->getAccessToken($code);

            $user->update([
                'spotify_access_token' => $tokens['access_token'],
                'spotify_refresh_token' => $tokens['refresh_token'],
                'spotify_token_expires_at' => now()->addSeconds($tokens['expires_in'] - 60)
            ]);

            $spotifyUser = $this->spotifyService->obtenerUsuario($tokens['access_token']);

            Log::info("Spotify tokens guardados en la BBDD para el admin" , [
                'admin_id' => $user->id,
                'spotify_user_id' => $spotifyUser['id'] ?? 'N/A'
            ]);

            return response()->json([
                'message' => 'Autenticación de Spotify exitosa. Tokens guardados en la BBDD',
                'spotify_user_id' => $spotifyUser['id'] ?? null
            ]);
        } catch (Exception $e) {
            Log::error("Fallo al intercambiar el código por tokens: " . $e->getMessage());
            return response()->json([
                'error' => 'Fallo al obtener los tokens de Spotify'
            ], 500);
        }
    }
}
