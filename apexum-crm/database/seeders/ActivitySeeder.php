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
        // Activity owners can be SALES_REP or MANAGER
        $activityOwnerIds = User::whereIn('role', [User::ROLE_SALES_REP, User::ROLE_MANAGER])->pluck('id');

        // Activities linked to opportunities (and their customers)
        Opportunity::with('customer:id')->chunk(100, function ($opps) use ($activityOwnerIds) {
            foreach ($opps as $opp) {
                Activity::factory()
                    ->count(rand(2, 4))
                    ->state(fn () => [
                        'customer_id'    => $opp->customer_id,
                        'opportunity_id' => $opp->id,
                        'owner_id'       => $activityOwnerIds->random(),
                    ])
                    ->create();
            }
        });

        // Customer-only activities (no opportunity)
        $customerIds = Customer::pluck('id');
        Activity::factory()
            ->count(10)
            ->state(fn () => [
                'customer_id'    => $customerIds->random(),
                'opportunity_id' => null,
                'owner_id'       => $activityOwnerIds->random(),
            ])
            ->create();
    }
}
