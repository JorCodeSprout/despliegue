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
        Schema::table('canciones_playlist', function (Blueprint $table) {
            $table->enum('estado_reproduccion', ['PENDIENTE', 'REPRODUCIDA', 'SALTADA'])
                ->default('PENDIENTE')
                ->after('artista');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('canciones_playlist', function (Blueprint $table) {
            $table->dropColumn('estado_reproduccion');
        });
    }
};
