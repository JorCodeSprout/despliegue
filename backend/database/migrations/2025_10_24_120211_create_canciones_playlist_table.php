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
        Schema::create('canciones_playlist', function (Blueprint $table) {
            $table->id();
            $table->string('id_spotify')->unique();
            $table->string('titulo');
            $table->string('artista');

            $table->foreignId('anadida_por_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canciones_playlist');
    }
};
