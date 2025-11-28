<?php

/*
 * SpotifyApiService
 * ===========================
 * Este servicio se encargará de gestionar la unión de mi aplicación con la API de Spotify. Su objetivo es centralizar
 * la lógica de autenticación y la ejecución de consultas. Se utiliza la librería Guzzle para peticiones HTTP.
 */

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SpotifyApiService {
    protected Client $cliente;
    protected string $clientId;
    protected string $clientSecret;
    protected string $redirectUri;
    protected string $baseUrl = 'https://api.spotify.com/v1//';

    // Clave para almacenar el token de credenciales del cliente en el caché
    private const CLIENT_CREDENTIALS_CACHE_KEY = 'spotify_client_token';

    public function __construct() {
        $this->clientId = config('services.spotify.client_id');
        $this->clientSecret = config('services.spotify.client_secret');
        $this->redirectUri = config('services.spotify.redirect_uri');

        $this->cliente = new Client();
    }

    /*
     * getAuthUrl
     * ==================
     * Este método construye la URL de redirección para iniciar el flujo de autenticación del administrador.
     * Datos recibidos:
     *  1. scope --> permisos solicitados a Spotify
     *  2. state --> código aleatorio para prevención de CSRF
     *
     * Devuelve la ruta completa de autenticación de Spotify
     */
    public function getAuthUrl(string $scope, string $state): string {
        $params = [
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'scope' => $scope,
            'state' => $state,
            // Obliga a Spotify a mostrar la pantalla de login/consentimiento
            'show_dialog' => true,
        ];

        return 'https://accounts.spotify.com/authorize?' . http_build_query($params);
    }

    /*
     * getAccessToken
     * =====================
     * Este método se encarga de intercambiar el código de autorización temporal recibido en el callback por el Access
     * Token y el Refresh Token del admin. Recibe un código el cual es el recibido del callback de Spotify.
     * En el caso de que todo vaya correctamente devuelve un array con el Access Token y el Refresh Token con un tiempo
     * de expiración.
     *
     * En el caso de que ocurra algún error lanzará una excepción ClientException.
     */
    public function getAccessToken(string $code) {
        try {
            $response = $this->cliente->post('https://accounts.spotify.com/api/token', [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => $this->redirectUri,
                    // 'client_id' => $this->clientId,
                    // 'client_secret' => $this->clientSecret,
                ],
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret),
                ]
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch(ClientException $e) {
            Log::error("Spotify Auth Error (Code Exchange): " . $e->getMessage());
            throw $e;
        }
    }

    /*
     * RefreshAccessToken
     * ============================
     * Este método será el encargado de que el Access Token se mantenga activo actualizándose constantemente de forma automática
     * Devuelve un array que contiene el nuevo access_token y el tiempo de expiración. Si la actualización falla se lanzará
     * una excepción ClientException.
     */
    public function refreshAccessToken(string $refreshToken): array {
        try {
            $response = $this->cliente->post('https://accounts.spotify.com/api/token', [
                'form_params' => [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $refreshToken,
                ],
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret),
                ]
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch(ClientException $e) {
            Log::error("Spotify Auth Error (Refresh Token): " . $e->getMessage());
            throw $e;
        }
    }

    /*
     * ObtenerUsuario
     * ========================
     * Este método consigue la información del perfil del usuario administrador autenticado y utiliza esa información para
     * verificar la conexión y obtener el ID de Spotify del administrador.
     *
     * Devuelve un array con los datos de dicho usuario y en el caso de que la petición a la API falle, lanza una excepción
     * ClientException
     */
    public function obtenerUsuario(string $accessToken): array
    {
        try {
            $response = $this->cliente->get($this->baseUrl . 'me', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);
            return json_decode((string) $response->getBody(), true);
        } catch(ClientException $e) {
            Log::error("Spotify API Get User Error: " . $e->getMessage());
            throw $e;
        }
    }

    /*
     * BuscarCanciones
     * ====================
     * Este método es el necesario para realizar la búsqueda de canciones en la aplicación. Utilizará las credenciales del
     * admin en la API de Spotify y mostrará la cantidad de un máximo de 10 canciones que se adapten a los resultados
     * de búsqueda.
     */
    public function buscarCanciones(string $query, string $accessToken): array {
        try {
            $response = $this->cliente->get($this->baseUrl . 'search', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'query' => [
                    'q' => $query,
                    'type' => 'track',
                    'limit' => 10,
                ],
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch(ClientException $e) {
            Log::error("Spotify API Search Error: " . $e->getMessage());
            return ['error' => 'Error al buscar en Spotify'];
        }
    }

    /*
     * AnadirCancion
     * ======================
     * En el caso de este método, se utilizará para gestionar las adiciones de las canciones a la playlist del administrador.
     * Require de un Access Token que debe tener el scope 'playlist-modify-public' para que la API funcione de forma correcta.
     *
     * Devuelve un booleano dependiendo de si se ha podido añadir o no.
     */
    public function anadirCancion(string $trackUri, string $playlistId, string $accessToken) {
        try {
            $this->cliente->post($this->baseUrl . "playlists/{$playlistId}/tracks", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'uris' => [$trackUri],
                ],
            ]);

            return true;
        } catch(ClientException $e) {
            Log::error("Spotify API Add Track Error: " . $e->getMessage());
            return false;
        }
    }

    /*
     * GetClientCredentialsToken
     * =================================
     * Este método es quizás el más importante, ya que es el encargado de actualizar las credenciales del admin para que
     * la sesión con la API no expire y no sea necesario ir ingresando siempre un nuevo token de acceso de manera manual.
     * El token se almacenará en la caché para evitar peticiones repetidas a Spotify.
     *
     * Devuelve una cadena con el access token o null en caso de error.
     */
    public function getClientCredentialsToken() {
        // Intentamos obtener el token de la caché
        if(Cache::has(self::CLIENT_CREDENTIALS_CACHE_KEY)) {
            return Cache::get(self::CLIENT_CREDENTIALS_CACHE_KEY);
        }

        // Si no está en la cache solicitamos un nuevo token a Spotify
        try {
            $authString = base64_encode($this->clientId . ":" . $this->clientSecret);

            $response = $this->cliente->post("https://accounts.spotify.com/api/token", [
                'form_params' => [
                    'grant_type' => 'client_credentials'
                ],
                'headers' => [
                    'Authorization' => 'Basic ' . $authString
                ],
            ]);


            $data = json_decode((string) $response->getBody(), true);

            if($response->getStatusCode() === 200 && isset($data['access_token'])) {
                $accessToken = $data['access_token'];
                $expiresIn = $data['expires_in'] ?? 360000;

                $cacheTime = $expiresIn > 300 ? $expiresIn - 300 : $expiresIn;
                Cache::put(self::CLIENT_CREDENTIALS_CACHE_KEY, $accessToken, $cacheTime);

                Log::info('Spotify Client Credentials Token generado y cacheado exitosamente', ['expires_in_seconds' => $expiresIn]);
                return $accessToken;
            }

            Log::error('Spotify Client Credentials: Respuesta de Spotify fallida', ['response_data' => $data]);
            return null;
        } catch (ClientException $e) {
            Log::error('Spotifya Client Credentials HTTP Error: ' . $e->getMessage());
            return null;
        } catch (\Exception $e) {
            Log::error("Error inesperado en getClientCredentialsToken: " . $e->getMessage());
            return null;
        }
    }

    public function eliminarCancion(string $trackUri, string $playlistId, string $accessToken) {
        try {
            $response = $this->cliente->delete($this->baseUrl . "playlists/{$playlistId}/tracks", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'tracks' => [
                        [ 
                            'uri' => $trackUri 
                        ]
                    ]
                ]
            ]);

            return $response->getStatusCode() === 200;
        } catch(ClientException $e) {
            Log::error("Spotify API Delete Error: " . $e->getMessage());
            return false;
        }
    }
}
