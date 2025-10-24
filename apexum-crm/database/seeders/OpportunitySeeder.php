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
        // Only SALES_REP can be owner of an Opportunity
        $salesRepIds = User::where('role', User::ROLE_SALES_REP)->pluck('id');

        Customer::select('id')->chunk(100, function ($customers) use ($salesRepIds) {
            foreach ($customers as $customer) {
                Opportunity::factory()
                    ->count(rand(1, 3))
                    ->state([
                        'customer_id' => $customer->id,
                        'owner_id'    => $salesRepIds->random(),
                    ])
                    ->create();
            }
        });
    }
}
