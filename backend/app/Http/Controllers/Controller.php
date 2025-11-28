<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    // Habilita el uso de la característica de Autorización de Solicitudes (AuthorizesRequests).
    // Usado para la verificación de permisos y políticas.
    use AuthorizesRequests;

    // Habilita el uso de la característica de Validación de Solicitudes (ValidatesRequests).
    // Usado para el método validate() en los controladores.
    use ValidatesRequests;
}