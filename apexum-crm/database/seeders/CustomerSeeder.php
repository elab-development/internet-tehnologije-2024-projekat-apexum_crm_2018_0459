<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Only SALES_REP can be owner of a Customer
        $salesRepIds = User::where('role', User::ROLE_SALES_REP)->pluck('id');

        Customer::factory()
            ->count(20)
            ->state(fn () => ['owner_id' => $salesRepIds->random()])
            ->create();
    }
}
