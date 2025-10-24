<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_id')->index();     // FK -> users.id (added later)
            $table->string('name');
            $table->string('email');                              // unique added later
            $table->string('phone');
            $table->string('website');
            $table->string('industry');
            $table->string('address');
            $table->string('image_url');
            $table->text('notes');
            $table->timestamps();
        });

        // Opportunities
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id')->index();  // FK -> customers.id
            $table->unsignedBigInteger('owner_id')->index();     // FK -> users.id
            $table->string('title');
            $table->enum('stage', ['prospecting','qualification','proposal','won','lost'])->default('prospecting');
            $table->decimal('amount', 12, 2);
            $table->date('close_date');
            $table->unsignedTinyInteger('probability');          // 0–100
            $table->string('source');
            $table->text('description');
            $table->timestamps();
        });

        // Activities
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id')->index();   // FK -> customers.id
            $table->unsignedBigInteger('opportunity_id')->index(); // FK -> opportunities.id (nullable later)
            $table->unsignedBigInteger('owner_id')->index();      // FK -> users.id
            $table->enum('type', ['call','email','meeting','task'])->default('task');
            $table->enum('status', ['open','completed','cancelled'])->default('open');
            $table->string('subject');
            $table->dateTime('due_at');
            $table->text('notes');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
        Schema::dropIfExists('opportunities');
        Schema::dropIfExists('customers');
    }
};
