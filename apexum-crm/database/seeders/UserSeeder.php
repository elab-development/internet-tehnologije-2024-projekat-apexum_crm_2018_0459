<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin (does not own records)
        User::factory()->admin()->create([
            'name'  => 'Apexum Admin',
            'email' => 'admin@apexumcrm.test',
        ]);

        // Managers & Sales Reps (can own Customers/Opportunities/Activities)
        User::factory()->count(2)->manager()->create();
        User::factory()->count(5)->salesRep()->create();
    }
}
