<?php

/*
 * CancionPlaylist
 * ===========================
 * Entidad que gestionará la playlist de la aplicación.
 *
 * Datos de la tabla
 * ---------------------------
 * id_spotify --> Id de la playlist de Spotify
 * titulo --> Título de la playlist
 * artista --> Artista de la canción
 * anadida_por_id --> FK obtenida del User que añade la canción a la playlist
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CancionPlaylist extends Model {
    use HasFactory;

    protected $table = 'canciones_playlist';

    protected $fillable = [
        'id_spotify',
        'titulo',
        'artista',
        'anadida_por_id',
    ];

    public function anadidaPor(): BelongsTo {
        return $this->belongsTo(User::class, 'anadida_por_id');
    }
}
