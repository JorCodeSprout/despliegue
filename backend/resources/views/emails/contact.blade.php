@component('mail::message')
# 📬 Nuevo Mensaje de Contacto

Has recibido un nuevo mensaje a través de tu formulario de contacto.

@component('mail::panel')
**Resumen del Contacto**

---

**👤 Nombre**: {{ $formData['name'] }}

**📧 Email**: {{ $formData['email'] }}

**📝 Asunto**: {{ $formData['subject'] }}

---
@endcomponent

## 💬 Mensaje del Usuario:

@component('mail::panel')
{{ $formData['message'] }}
@endcomponent

@component('mail::subcopy')
Este correo ha sido generado automáticamente por el sistema de contacto de {{ config('app.name') }}.
@endcomponent
@endcomponent