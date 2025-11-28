<?php

/*
 * Sugerencia
 * ====================
 * Entidad que se encarga de gestionar las sugerencias de canciones
 *
 * Datos de la tabla
 * -------------------------
 * id_spotify_cancion --> Id de Spotify que se le asigna a la canción
 * artista --> Nombre del artista o artistas de la canción
 * titulo --> Nombre de la canción
 * sugerida_por_id --> FK de User que solicitó la admisión de dicha canción
 * estado --> puede ser 'APROBADA', 'SUSPENDIDA', 'PENDIENTE'
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sugerencia extends Model {
    use HasFactory;

    protected $fillable = [
        'id_spotify_cancion',
        'artista',
        'titulo',
        'sugerencia_por_id',
        'estado', // APROBADA, SUSPENDIDA, PENDIENTE
    ];

    public function sugeridaPor(): BelongsTo {
        return $this->belongsTo(User::class, 'sugerencia_por_id');
    }
}
