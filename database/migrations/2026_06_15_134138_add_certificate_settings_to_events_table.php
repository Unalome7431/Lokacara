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
        Schema::table('events', function (Blueprint $table) {
            $table->string('certificate_template')->nullable();
            $table->string('certificate_font_family')->nullable();
            $table->string('certificate_font_size')->nullable();
            $table->string('certificate_font_color')->nullable();
            $table->double('certificate_x_pos')->nullable();
            $table->boolean('certificate_is_x_center')->default(true);
            $table->double('certificate_y_pos')->nullable();
            $table->boolean('certificate_is_y_center')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'certificate_template',
                'certificate_font_family',
                'certificate_font_size',
                'certificate_font_color',
                'certificate_x_pos',
                'certificate_is_x_center',
                'certificate_y_pos',
                'certificate_is_y_center'
            ]);
        });
    }
};
