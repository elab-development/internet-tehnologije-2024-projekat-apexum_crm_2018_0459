<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Seeder;

class OpportunitySeeder extends Seeder
{
    public function run(): void
    {
        $ownerIds = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->pluck('id');

        Customer::query()->select('id')->chunk(100, function ($customers) use ($ownerIds) {
            foreach ($customers as $customer) {
                Opportunity::factory()
                    ->count(rand(1, 3))
                    ->state([
                        'customer_id' => $customer->id,
                        'owner_id'    => $ownerIds->random(),
                    ])
                    ->create();
            }
        });
    }
}
