<?php

/*
 * ContactController
 * ==========================
 * Este controlador será el que se utilizará para gestionar el formulario de Contacto. Validará los datos recibidos y
 * los enviará a la dirección de correo que está definida en el .env como MAIL_USERNAME o si no hay ninguna utilizará
 * pruebasjorgead@gmail.com por defecto.
 */

namespace App\Http\Controllers;

use App\Mail\SendContactForm;
use Config;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Log;

class ContactController extends Controller
{

    public function index() {
        //
    }

    /*
     * Send
     * ==============
     * Recibe los datos y los valida.
     * Obtiene un nombre del usuario el cual está enviando el formulario, su correo electrónico, un asunto y el mensaje.
     * Los datos deben ser cadenas los cuales tienen las siguientes restricciones:
     *  1. Name --> Cadena de caracteres de no más de 100
     *  2. Email --> Cadena de caracteres en formato email y de no más de 255 caracteres
     *  3. Subject --> Cadena de caracteres de como mínimo 5 caracteres y como máximo 100 caracteres
     *  4. Message --> Cadena de caracteres de como máximo 3000 caracteres
     *
     * Este método primero utiliza un trycatch, el cual intenta enviar un mensaje con los datos recibidos gracias a la
     * clase Mail. En el caso de que dicho envío se realice correctamente mostrará un mensaje al usuario notificándole
     * de que se ha enviado con éxito, en caso contrario mostrará un mensaje de error.
     */
    public function send(Request $request) {
        // Validamos los datos del formulario
        $dataValidate = $this->validate($request, [
            "name" => "required|string|min:5|max:100",
            "email" => "required|string|email|max:255",
            "subject" => "required|string|min:5|max:100",
            "message" => "required|string|max:3000"
        ]);

        try {
            $emailRecepcion = env('MAIL_USERNAME', "pruebasjorgead@gmail.com");
            Mail::to($emailRecepcion)->send(new SendContactForm($dataValidate));

            return response()->json([
                'message' => '¡Mensaje enviado con éxito!',
                'status' => 'success'
            ], 200);
        } catch(Exception $e) {
            Log::error('Error al enviar el correo: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al enviar el mensaje. Inténtalo de nuevo más tarde',
                'status' => 'error',
            ], 500);
        }
    }
}
