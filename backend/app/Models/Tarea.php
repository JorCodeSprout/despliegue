<?php

/*
 * Tarea
 * ==================
 * Gestiona la entidad de tareas
 *
 * Datos de la tabla
 * ----------------------
 * titulo --> título de la tarea
 * descripción --> breve descripción de en qué consiste la tarea
 * recompensa --> cantidad de puntos que conseguirás si apruebas la tarea
 * creador_id --> FK User (Profesor) que ha creado la tarea
 * fecha --> Fecha en la que tiene que ser entregada la tarea
 * reenviar --> boolean que da la opción de poder realizar más de una entrega para una misma tarea
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarea extends Model {
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descripcion',
        'recompensa',
        'creador_id',
        'fecha',
        'reenviar',
    ];

    public function creador(): BelongsTo {
        return $this->belongsTo(User::class, 'creador_id');
    }

    public function entregas(): HasMany {
        return $this->hasMany(Entrega::class);
    }
}
