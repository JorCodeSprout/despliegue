<?php

namespace App\Http\Controllers;

use App\Services\SpotifyApiService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class SpotifyTokenController extends Controller {
    protected SpotifyApiService $spotifyService;

    public function __construct(SpotifyApiService $spotifyApiService) {
        $this->spotifyService = $spotifyApiService;
    }

    /**
     * Summary of getSpotifyToken
     * @param \Illuminate\Http\Request $request
     * RUTA: /api/spotify_token
     */
    public function getSpotifyToken(Request $request) {
        try {
            $access_token = $this->spotifyService->getClientCredentialsToken();

            if(!$access_token) {
                Log::error('Spotify Token: Fallo al obtener el Client Credentials Token');
                return response()->json(['error' => 'No se pudo generar el token de Spotify'], 503);
            }

            return response()->json([
                'accessToken' => $access_token
            ]);
        } catch (\Exception $e) {
            Log::error('Error inesperado al generar el token de Spotify' . $e->getMessage());
            return response()->json(['error' => 'Error interno al procesar el token de Spotify'], 500); 
        }
    }
}