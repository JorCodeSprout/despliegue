<?php

/*
 * MusicaController
 * =========================
 * Este controlador será el encargado de gestionar toda la parte de las solicitudes de canciones, en donde habrá una
 * parte de solicitud, una de aceptar o cancelar dicha solicitud la cual si es así se añadirá la canción a una playlist,
 * listar todas las canciones que haya actualmente en dicha playlist y la gestión de un buscador de canciones. Todo esto
 * se utilizará en unión con la API de Spotify.
 */
namespace App\Http\Controllers;

use App\Models\CancionPlaylist;
use App\Models\Sugerencia;
use App\Models\User;
use App\Services\SpotifyApiService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MusicaController extends Controller {
    protected SpotifyApiService $spotifyApiService;

    private const CACHE_KEY_PREFIX = 'spotify_admin_tokens_';

    private function getAdminAccessToken() {
        $admin = Auth::user();

        if(!$admin->spotify_access_token || !$admin->spotify_refresh_token) {
            Log::warning("Spotify tokens faltantes en la BBDD para Admin. Requerida reautenticación");
            return null;
        }

        if(now()->addMinutes(5)->greaterThan($admin->spotify_token_expires_at)) {
            $refreshToken = $admin->spotify_refresh_token;

            try {
                $newToken = $this->spotifyApiService->refreshAccessToken($refreshToken);

                $admin->update([
                    'spotify_access_token' => $newToken['access_token'],
                    'spotify_refresh_token' => $newToken['refresh_token'] ?? $refreshToken,
                    'spotify_token_expires_at' => now()->addSeconds($newToken['expires_in'] - 60)
                ]);

                Log::info("Spotify Access Token refrescado con éxito para el Admin");
                return $newToken['access_token'];
            } catch(Exception $e) {
                Log::error("Fallo crítico al refrescar el token de Spotify del Admin: " . $e->getMessage());

                $admin->update([
                    'spotify_access_token' => null,
                    'spotify_refresh_token' => null,
                    'spotify_token_expires_at' => null
                ]);

                return null;
            }
        }

        return $admin->spotify_access_token;
    }

    public function __construct(SpotifyApiService $spotifyService) {
        $this->middleware('auth:api');
        $this->spotifyApiService = $spotifyService;
    }

    /*
     * SugerirCancion
     * ===================
     * Método que se encarga de añadir las solicitudes a la base de datos mediante un botón que contiene los datos
     * id_spotify_cancion --> Envía el código de identificación de la canción en Spotify
     * titulo --> Envía el título de la canción
     * artista --> Envía el o los artistas que participan en la canción
     *
     * Además de los datos que se enviarán con el botón de la canción, también se enviará
     * sugerencia_por_id --> Contiene el id del usuario que hizo la solicitud
     * estado --> Por defecto se le dará el valor de PENDIENTE, el cual cambiará una vez que se acepte o se cancele la
     *            solicitud.
     *
     * Devuelve con objeto JSON que contiene un mensaje de notificación de que se ha enviado la solicitud y los datos de
     * la sugerencia enviada.
     */
    public function sugerirCancion(Request $request) {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autorizado. Se requiere un token válido.'], 401);
        }

        $validado = Validator::make($request->all(), [
            'id_spotify_cancion' => 'required|string|max:100|unique:sugerencias,id_spotify_cancion',
            'titulo' => 'required|string|max:255',
            'artista' => 'required|string|max:255'
        ]);

        if($validado->fails()) {
            return response()->json($validado->errors(), 422);
        }

        $sugerencia = Sugerencia::create([
            'id_spotify_cancion' => $request->id_spotify_cancion,
            'titulo' => $request->titulo,
            'artista' => $request->artista,
            'sugerencia_por_id' => Auth::id(),
            'estado' => 'PENDIENTE',
        ]);

        return response()->json(['message' => 'Sugerencia enviada para revisión', 'sugerencia' => $sugerencia], 201);
    }

    /*
     * Listado
     * =============
     * Se mostrará un listado con las canciones sugeridas. Habrá dos opciones:
     * 1.- Eres profesor o admin
     *          En este caso se mostrarán todas las sugerencias recibidas que no hayan sido procesadas todavía
     * 2.- No eres profesor o admin
     *          En este caso se te mostrarán solo las sugerencias que has realizado tú
     */
    public function listado() {
        $relacion = 'sugeridaPor'; 

        Gate::allows('profesor-or-admin')
            ? $sugerencias = Sugerencia::with($relacion)
                    ->where('estado', 'PENDIENTE')
                    ->get()
            : $sugerencias = Sugerencia::with($relacion)
                    ->where('sugerencia_por_id', Auth::id())
                    ->get();

        return response()->json($sugerencias);
    }

    /*
     * AnadirPlaylist
     * ===================
     * En este caso el único que tendrá acceso será el administrador, entonces si no lo eres, no te dejará añadir ninguna
     * canción a la playlist y en ese caso te mostrará un mensaje de error de acceso.
     * En este método se cogerán todos los datos del método sugerirCancion y los enviará a otra tabla de la base de datos
     * la cual contendrá el id del administrador que ha aceptado la solicitud.
     *
     * En el caso de ser añadida a la playlist, la canción pasará a tener un estado de APROBADA.
     */
    public function anadirPlaylist(Request $request, Sugerencia $sugerencia) {
        if(Gate::denies('admin-only')) {
            return response()->json(['error' => 'Solo el administrador puede gestionar la playlist']);
        }

        $unica = Validator::make([
            'id_spotify' => $sugerencia->id_spotify_cancion
        ], [
            'id_spotify' => 'required|unique:canciones_playlist,id_spotify',
        ]);

        if($unica->fails()) {
            return response()->json([
                "error" => "La canción ya está en la playlist"
            ], 422);
        }

        $token = $this->getAdminAccessToken();
        if(!$token) {
            return response()->json([
                'error' => 'Error de autenticación Spotify. El Administrador debe volver a autenticarse.'
            ], 401);
        }

        $playlistId = config('services.spotify.playlist_id');
        $trackUri = "spotify:track:{$sugerencia->id_spotify_cancion}";

        $sugeridoId = $sugerencia->sugerencia_por_id;

        $sugeridor = User::find($sugeridoId);

        if($sugeridor) {
            if($sugeridor->puntos < 50) {
                return response()->json([
                    'error' => 'El usuario que realizó la solicitud no tiene suficientes puntos'
                ], 403);
            }
            
            $sugeridor->decrement('puntos', 50);
            Log::info("Se han descontado 50 puntos del usuario con ID: {$sugeridoId} por la solicitud", [
                'puntos_actuales' => $sugeridor->puntos
            ]);
        } else {
            Log::warning("No se encontró al usuario con ID: {$sugeridoId} para descontarle los puntos correspondientes");
        }

        $sugerencia->update(['estado' => 'APROBADA']);

        $anadirSpotify = $this->spotifyApiService->anadirCancion($trackUri, $playlistId, $token);

        if(!$anadirSpotify) {
            Log::error('No se ha podido añadir la canción a Spotify.', [
                'track_uri' => $trackUri,
                'admin_id' => Auth::id()
            ]);
            return response()->json([
                'error' => 'Fallo al añadir la canción a Spotify'
            ], 503);
        }

        $cancionAnadida = CancionPlaylist::create([
            'id_spotify' => $sugerencia->id_spotify_cancion,
            'artista' => $sugerencia->artista,
            'titulo' => $sugerencia->titulo,
            'anadida_por_id' => Auth::id(),
            'estado_reproduccion' => 'PENDIENTE'
        ]);

        return response()->json([
            "message" => "Canción añadida a la playlist",
            "cancion" => $cancionAnadida
        ], 201);
    }

    /*
     * CancelarCancion
     * ===================
     * Este método se encargará de actualizar la base de datos que gestiona las canciones sugeridas por los usuarios
     * haciendo que si una canción no es válida para ser añadida a la playlist simplemente será descartada y establecida
     * con un estado de SUSPENDIDA. Al igual que anadirPlaylist será necesario ser admin para poder realizar cambios en
     * la playlist, por lo que si no eres administrador, se te mostrará un mensaje de error de acceso.
     *
     * Devolverá un mensaje de que se ha cancelado la sugerencia.
     */
    public function cancelarCancion(Request $request, Sugerencia $sugerencia) {
        if(Gate::denies('admin-only')) {
            return response()->json(['error' => 'Solo el administrador puede gestionar la playlist']);
        }

        $sugerencia->update(['estado' => 'RECHAZADA']);

        return response()->json([
            "message" => "Sugerencia rechazada correctamente",
            "cancion" => $sugerencia
        ], 200);
    }

    /*
     * MarcarComoReproducida
     * =================================
     * Método que se encargará de actualizar el estado de las canciones de la playlist. Solo el administrador tendrá acceso
     * para actualizar el estado, y en caso de no serlo se te rechazará el acceso.
     *
     * Devuelve el objeto CancionPlaylist
     */
    public function marcarComoReproducida(CancionPlaylist $cancion) {
        if(Gate::denies('admin-only')) {
            return response()->json(['error' => 'Solo el administrador puede gestionar la playlist']);
        }

        $cancion->update(['estado_reproduccion' => 'REPRODUCIDA']);

        return response()->json([
            'message' => 'Canción marcada como reproducida y eliminada de la playlist',
            'cancion' => $cancion
        ], 200);
    }

    /*
     * getPlaylist
     * ================
     * Este método se encargará de recuperar todas las canciones que haya en la playlist en el momento en el que se
     * llame a dicho método.
     */
    public function getPlaylist() {
        $playlistActiva = CancionPlaylist::where('estado_reproduccion', 'PENDIENTE')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($playlistActiva);
    }

    /*
     * buscarSpotify
     * ===================
     * Este método será el encargado de interactuar con la API, el cual recibe una solicitud (query) y con la API de Spotify
     * mostrará los resultados que se adapten a dicha query, la cual ha de ser una canción, un artista o un album.
     */
    public function buscarSpotify(Request $request) {
        $validado = Validator::make($request->all(), [
            'query' => 'required|string|min:3'
        ]);

        if($validado->fails()) {
            return response()->json($validado->errors(), 422);
        }

        $token = $this->spotifyApiService->getClientCredentialsToken();

        if(!$token) {
            return response()->json(['error' => 'No se ha podido obtener el token de autorización de Spotify'], 503);
        }

        try {
            $response = Http::withToken($token)->get('https://api.spotify.com/v1/search', [
                'q' => $request->query('query'),
                'type' => 'artist,album,track',
                'limit' => 9
            ]);

            if($response->successful()) {
                $data = $response->json();

                if(isset($data['tracks']['items'])) {
                    return response()->json($data['tracks']['items']);
                }

                return response()->json([], 200);
            }

            return response()->json([
                'error' => 'Ha habido un problema en la búsqueda',
                'details' => $response->json()
            ], $response->getStatusCode());
        } catch(Exception $e) {
            Log::error(`Error al intentar buscar en Spotify: {$e->getMessage()}`);
            return response()->json(['error' => 'Error de conexión con Spotify'], 500);
        }
    }

    /*
     * EliminarCancionPlaylist
     * =================================
     * Método que se encargará de eliminar oficialmente la canción que se reproduzca de la playlist oficial de Spotify
     * siempre y cuando haya un mínimo de 10 canciones. De esta manera no habrá una cantidad infinita de canciones y se
     * controlará de mejor manera dicha playlist.
     */
    public function eliminarCancionPlaylist(CancionPlaylist $cancionPlaylist) {
        if(Gate::denies('admin-only')) {
            return response()->json(['error' => 'Solo el administrador puede eliminar la playlist']);
        }

        $accessToken = $this->getAdminAccessToken();
        if(!$accessToken) {
            return response()->json(['error' => 'No se pudo obtener el token de Spotify'], 401);
        }

        $playlistId = config('services.spotify.playlist_id');
        $track = "spotify:track:{$cancionPlaylist->id_spotify}";

        $eliminarSpotify = $this->spotifyApiService->eliminarCancion($track, $playlistId, $accessToken);

        if(!$eliminarSpotify) {
            return response()->json([
                'error' => 'Falló la eliminación de Spotify. Revisa tus permisos a la playlist.'
            ], 503);
        }

        $cancionPlaylist->delete();
        return response()->json([null, 204]);
    }
}
