<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Define los orígenes permitidos
        $allowedOrigins = [
            // Orígenes del Frontend (React/Vite)
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'https://localhost:5173',

            // Orígenes específicos de ritmatiza.local
            'http://ritmatiza.local',
            'https://ritmatiza.local',
            'http://ritmatiza.local:3000',
            'https://ritmatiza.local:3000',

            'http://localhost:3000',
            'https://localhost:3000',
            'https://ritmatiza.netlify.app'
        ];

        // Obtener el origen de la solicitud
        $origin = $request->header('Origin');
        $allowedOrigin = null;

        // Comprueba si el origen está en la lista de permitidos
        if (in_array($origin, $allowedOrigins)) {
            $allowedOrigin = $origin;
        }

        // Ejecuta la petición al controlador
        $response = $next($request);

        // Si $allowedOrigin es nulo (no está permitido), usa el primero de la lista
        // o considera el * (cuidado con esto en producción, pero es útil para debugging)
        $finalAllowedOrigin = $allowedOrigin ?? $allowedOrigins[0];

        // Añade las cabeceras CORS a la respuesta
        $response->header('Access-Control-Allow-Origin', $finalAllowedOrigin);
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization, X-Requested-With'); // Añadida X-Requested-With
        $response->header('Access-Control-Allow-Credentials', 'true');

        // Si la solicitud es un pre-vuelo (OPTIONS), devuelve la respuesta inmediatamente.
        if ($request->isMethod('OPTIONS')) {
            // Devuelve una respuesta vacía con el código 204 para OPTIONS, que es lo que espera CORS.
            return response('', 204)->withHeaders([
                'Access-Control-Allow-Origin' => $finalAllowedOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, X-Auth-Token, Origin, Authorization, X-Requested-With',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        return $response;
    }
}
