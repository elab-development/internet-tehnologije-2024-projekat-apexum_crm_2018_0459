<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->unique('email', 'customers_email_unique');
        });

        Schema::table('opportunities', function (Blueprint $table) {
            // Prevent duplicate-named opportunities under the same customer
            $table->unique(['customer_id', 'title'], 'opp_customer_title_unique');
        });
    }

    public function down(): void
    {
        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropUnique('opp_customer_title_unique');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique('customers_email_unique');
        });
    }
};
