<?php

/*
 * AuthController
 * =========================
 * Este controlador será el encargado de gestionar toda la parte de autenticación de la aplicación. Aquí se gestionarán
 * los métodos encargados del login, registro, logout y formateo del token.
 * Todas las ventanas relacionadas con estos métodos necesitarán que el usuario se autentifique menos el login
 * y el registro.
 */

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller {
    public function __construct() {

        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /*
     * Login
     * ==============
     * Se reciben el email y la contraseña (que deberán pasar una validación antes) y se comproborarán para ver
     * si coinciden con los datos de la BBDD.
     * Para que el email y la contraseña pasen la validación deberán de:
     * 1.- Email --> Estar en formato email (\^.+@.+\..+$\).
     * 2.- Password --> Ser una cadena de caracteres con un mínimo de 6.
     *
     * Este método devolverá el token y los datos del usuario que se ha logueado.
    */
    public function login(Request $request) {
        $validacion = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        if($validacion->fails()) {
            return response()->json($validacion->errors(), 422);
        }

        $credenciales = $request->only('email', 'password');

        if(!$token = Auth::guard('api')->attempt($credenciales)) {
            return response()->json(['error' => 'No autorizado. Credenciales inválidas'], 401);
        }

        $user = Auth::guard('api')->user();

        return $this->respondWithToken($token, $user);
    }

    /*
     * Register
     * ==========
     * Al igual que el login, los datos enviados deberán pasar una validación. Dichos datos en este caso serán el nombre,
     * el email y la contraseña. Para su correcta validación el email en este caso deberá ser único y con un máximo de
     * 255 caracteres, y en el caso del nombre la única restricción que tiene es que debe ser una cadena de caracteres
     * de no más de 100. Para la contraseña las restricciones serán las mismas que en el login.
     *
     * Una vez que pase la validación de los datos, se creará un nuevo usuario donde se le insertarán los siguientes
     * datos:
     *  1. Name --> Nombre ingresado en el formulario
     *  2. Email --> Email ingresado en el formulario
     *  3. Password --> Contraseña ingresada en el formulario (la cual se deberá confirmar ingresándola 2 veces)
     *  4. Role --> Por defecto se le asignará el rol de ESTUDIANTE, el cual se podrá cambiar más adelante
     *  5. Puntos --> Todos los usuarios comienzan con 0 puntos.
     *
     * Este método devuelve un conjunto del token que se creará al crear el usuario y el usuario creado.
     */
    public function register(Request $request) {
        $validacion = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6'
        ]);

        if($validacion->fails()) {
            return response()->json($validacion->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'ESTUDIANTE',
            'puntos' => 0
        ]);

        $credenciales = $request->only('email', 'password');
        $token = Auth::guard('api')->attempt($credenciales);

        return $this->respondWithToken($token, $user);
    }

    /*
     * Logout
     * ============
     * Este método simplemente utilizará el método logout() por defecto de la clase Auth de Laravel para cerrar la
     * sesión y eliminar todos los token y cookies.
     *
     * Devolverá un mensaje en formato JSON indicando que la sesión se ha cerrado de forma exitosa.
     */
    public function logout() {
        Auth::logout();

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    /*
     * Refresh
     * ============
     * Este método se encargará de refrescar los datos del usuario y el token creado para que la sesión pueda seguir
     * activa.
     *
     * Devolverá, al igual que el login y el register, un conjunto del token y los datos del usuario.
     */
    public function refresh() {
        $user = Auth::user();
        $token = Auth::refresh();
        return $this->respondWithToken($token, $user);
    }

    /*
     * RespondWithToken
     * ========================0
     * Este método se encargará de gestionar el token del usuario y el cual se utilizará en el resto de métodos.
     * Dicho método crea un token de tipo bearer, que expire en 3600 segundos (1 hora) y tenga un dato user que almacene
     * los datos del usuario que no sean sensibles, como lo son el id, nombre, email, role, puntos y profesor_id,
     * es decir, todos los datos del usuario menos la contraseña.
     *
     * Devolverá un objeto JSON con todos los datos obtenidos y sus claves.
     * 'access_token' --> token del usuario
     * 'token_type' --> 'bearer ' (Token de portador)
     * 'expires_in' --> expiración del token si no se hace nada en la aplicación
     * 'user' --> Datos del usuario
     */
    protected function respondWithToken($token, $user) {
        $ttl = Config::get('jwt.ttl', 60);
        $userData = $user->only(['id', 'name', 'email', 'role', 'puntos', 'profesor_id']);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $ttl * 60,
            'user' => $userData
        ]);
    }
}
