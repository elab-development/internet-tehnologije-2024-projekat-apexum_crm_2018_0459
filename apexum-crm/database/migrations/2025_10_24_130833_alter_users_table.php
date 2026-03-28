<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // remove defaults we don't use
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->dropColumn('email_verified_at');
            }
            if (Schema::hasColumn('users', 'remember_token')) {
                $table->dropColumn('remember_token');
            }

            // add CRM-specific columns
            if (! Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin','manager','sales_rep'])
                      ->default('sales_rep')
                      ->after('password');
            }
            if (! Schema::hasColumn('users', 'image_url')) {
                $table->string('image_url')->nullable()->after('role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'image_url')) {
                $table->dropColumn('image_url');
            }
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }

            // restore defaults
            if (! Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            }
            if (! Schema::hasColumn('users', 'remember_token')) {
                $table->rememberToken();
            }
        });
    }
};
