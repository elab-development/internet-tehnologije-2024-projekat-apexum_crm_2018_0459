<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Only managers & sales reps can own records
        $ownerIds = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->pluck('id');

        Customer::factory()
            ->count(20)
            ->state(fn () => ['owner_id' => $ownerIds->random()])
            ->create();
    }
}
