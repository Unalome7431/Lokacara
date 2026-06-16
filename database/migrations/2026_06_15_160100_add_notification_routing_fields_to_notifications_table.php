<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('category')->nullable()->after('type');
            $table->string('target')->nullable()->after('category');
            $table->foreignId('event_id')->nullable()->after('target')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn(['category', 'target', 'event_id']);
        });
    }
};
