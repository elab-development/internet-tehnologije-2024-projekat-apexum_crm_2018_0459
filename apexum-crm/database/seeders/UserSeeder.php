<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin (no ownership of domain records)
        User::factory()->admin()->create([
            'name'  => 'Apexum Admin',
            'email' => 'admin@apexumcrm.test',
        ]);

        // Managers & Sales Reps
        User::factory()->count(2)->manager()->create();
        User::factory()->count(5)->salesRep()->create();
    }
}
