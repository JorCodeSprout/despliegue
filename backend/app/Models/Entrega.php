<?php
/*
 * Entrega
 * =================
 * Entidad que gestiona las entregas de tareas.
 *
 * Datos de la tabla
 * ----------------------------
 * ruta --> Ruta del archivo entregado
 * estado --> puede ser 'PENDIENTE', 'APROBADA', 'SUSPENDIDA'
 * estudiante_id --> FK de User que realiza dicha entrega
 * tarea_id --> FK de Tarea a la que se realiza la entrega
 * calificador_id --> FK de User (PROFESOR o ADMIN) que corrige la entrega
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entrega extends Model {
    use HasFactory;

    protected $table = 'entregas';

    protected $fillable = [
        'ruta',
        'estado', // PENDIENTE, APROBADA, SUSPENDIDA
        'estudiante_id',
        'tarea_id',
        'calificador_id',
    ];

    public function tarea(): BelongsTo {
        return $this->belongsTo(Tarea::class);
    }

    public function estudiante(): BelongsTo {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function calificador(): BelongsTo {
        return $this->belongsTo(User::class, 'calificador_id');
    }
}
