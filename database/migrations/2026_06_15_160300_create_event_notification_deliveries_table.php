<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('reminder_offset')->nullable();
            $table->foreignId('notification_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('push_sent_at')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id', 'category', 'reminder_offset'], 'unique_delivery');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_notification_deliveries');
    }
};
