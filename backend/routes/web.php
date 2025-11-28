<?php

/*
 * Este archivo será el encargado de gestionar las redirecciones del navegador (el OAuth de Spotify) y para servir
 * la vista principal de la web.
 */

use App\Http\Controllers\SpotifyAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});