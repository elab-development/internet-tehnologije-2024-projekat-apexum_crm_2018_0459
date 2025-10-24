<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreign('owner_id')
                  ->references('id')->on('users')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
        });

        Schema::table('opportunities', function (Blueprint $table) {
            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();

            $table->foreign('owner_id')
                  ->references('id')->on('users')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();

            $table->foreign('opportunity_id')
                  ->references('id')->on('opportunities')
                  ->cascadeOnUpdate()
                  ->nullOnDelete(); // activity can outlive an opportunity

            $table->foreign('owner_id')
                  ->references('id')->on('users')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropForeign(['opportunity_id']);
            $table->dropForeign(['customer_id']);
        });

        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropForeign(['customer_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
        });
    }
};
