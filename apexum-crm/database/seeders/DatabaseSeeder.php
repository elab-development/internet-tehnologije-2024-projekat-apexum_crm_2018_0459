<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CustomerSeeder::class,     // customers owned only by sales reps
            OpportunitySeeder::class, // opportunities owned only by sales reps
            ActivitySeeder::class,    // activities owned by reps or managers
        ]);
    }
}
