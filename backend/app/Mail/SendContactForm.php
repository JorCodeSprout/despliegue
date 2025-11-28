<?php

/*
 * SendContactForm
 * =======================
 * Esta clase Mailable será la encargada de gestionar el envío de correos electrónicos generados a partir del formulario
 * de contacto de la aplicación. Se encarga de formatear los datos enviados y definir el asunto, la dirección de respuesta
 * y el contenido del correo antes de ser enviado.
 */

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendContactForm extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Contiene todos los datos enviados a traves del formulario de contacto. Incluye 'name,, 'email', 'subject' y el
     * mensaje en si.
     * @var array
     */
    public array $formData;

    public function __construct(array $formData)
    {
        $this->formData = $formData;
    }

    /*
     * Envelope
     * ==============
     * Devuelve un conjunto del email que se encargará de enviar el email y el asunto, el cual será 'Contacto: "asunto"'
     * Utilizamos "replyTo:" para configurar la dirección de correo y el nombre del remitente original para que si respondemos
     * el email, la respuesta vaya directamente a él.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [
                new Address($this->formData['email'], $this->formData['name']),
            ],

            subject: 'Contacto: ' . $this->formData['subject'],
        );
    }

    /*
     * Content
     * ================
     * Define el contenido del mensaje escrito en Markdown. El formato del mensaje estará definido en
     * 'Ritmatiza/backend/resources/views/emails/contact.blade.php'.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact',
        );
    }

    /**
     * Attachments
     * ==================
     * Define los archivos adjuntos que se incluirán en el correo. Por defecto se devuelve un array vacío ya que el formulario
     * no contendrá ningun archivo adjunto.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
