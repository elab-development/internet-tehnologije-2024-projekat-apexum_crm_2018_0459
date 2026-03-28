<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users
        Schema::table('users', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });

        // Customers
        Schema::table('customers', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->string('website')->nullable()->change();
            $table->string('industry')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->string('image_url')->nullable()->change();
            $table->text('notes')->nullable()->change();
        });

        // Opportunities
        Schema::table('opportunities', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->nullable()->change();
            $table->date('close_date')->nullable()->change();
            $table->unsignedTinyInteger('probability')->nullable()->change();
            $table->string('source')->nullable()->change();
            $table->text('description')->nullable()->change();
        });

        // Activities
        Schema::table('activities', function (Blueprint $table) {
            $table->unsignedBigInteger('opportunity_id')->nullable()->change();
            $table->dateTime('due_at')->nullable()->change();
            $table->text('notes')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Users
        Schema::table('users', function (Blueprint $table) {
            $table->string('image_url')->nullable(false)->change();
        });

        // Customers
        Schema::table('customers', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
            $table->string('website')->nullable(false)->change();
            $table->string('industry')->nullable(false)->change();
            $table->string('address')->nullable(false)->change();
            $table->string('image_url')->nullable(false)->change();
            $table->text('notes')->nullable(false)->change();
        });

        // Opportunities
        Schema::table('opportunities', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->nullable(false)->change();
            $table->date('close_date')->nullable(false)->change();
            $table->unsignedTinyInteger('probability')->nullable(false)->change();
            $table->string('source')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });

        // Activities
        Schema::table('activities', function (Blueprint $table) {
            $table->unsignedBigInteger('opportunity_id')->nullable(false)->change();
            $table->dateTime('due_at')->nullable(false)->change();
            $table->text('notes')->nullable(false)->change();
        });
    }
};
