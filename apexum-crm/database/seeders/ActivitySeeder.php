<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $ownerIds = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->pluck('id');

        // Create activities tied to opportunities (and their customers)
        Opportunity::query()->with('customer:id')->chunk(100, function ($opps) use ($ownerIds) {
            foreach ($opps as $opp) {
                Activity::factory()
                    ->count(rand(2, 4))
                    ->state(fn () => [
                        'customer_id'    => $opp->customer_id,
                        'opportunity_id' => $opp->id,
                        'owner_id'       => $ownerIds->random(),
                    ])
                    ->create();
            }
        });

        // Plus a few customer-only activities (no opportunity)
        $customerIds = Customer::query()->pluck('id');
        Activity::factory()
            ->count(10)
            ->state(fn () => [
                'customer_id'    => $customerIds->random(),
                'opportunity_id' => null,
                'owner_id'       => $ownerIds->random(),
            ])
            ->create();
    }
}
