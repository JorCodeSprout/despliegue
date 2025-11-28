<?php

/*
 * AuthServiceProvider
 * ==========================
 * En esta clase se gestionarán los permisos existentes para que sea más sencillo gestionar los accesos dependiendo del
 * role que tenga un usuario.
 */

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     * Definimos aquí los Gates para el control de acceso basado en role (RITMATIZA).
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // 1. Gate: Solo para el rol ADMIN
        Gate::define('admin-only', fn (User $user) => $user->isAdmin());

        // 2. Gate: Para PROFESOR o ADMIN (Usado para crear y calificar Tareas)
        Gate::define('profesor-or-admin', fn (User $user) => $user->isProfesor());

        // 3. Gate: Para ESTUDIANTE o ADMIN (Usado para subir entregas, sugerir canciones)
        Gate::define('estudiante-or-admin', fn (User $user) => $user->isEstudiante() || $user->isAdmin());
    }
}
