<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sugerencias', function (Blueprint $table) {
            $table->id();
            $table->string('id_spotify_cancion');
            $table->string('artista');
            $table->string('titulo');
            $table->foreignId('sugerencia_por_id')->constrained('users');
            $table->enum('estado', ['APROBADA', 'RECHAZADA', 'PENDIENTE'])->default('PENDIENTE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sugerencias');
    }
};
