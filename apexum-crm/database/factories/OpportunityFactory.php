<?php

namespace Database\Factories;

use App\Models\Opportunity;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OpportunityFactory extends Factory
{
    protected $model = Opportunity::class;

    public function definition(): array
    {
        $customer = Customer::query()->inRandomOrder()->first() ?? Customer::factory()->create();

        // owners allowed: manager or sales_rep (NOT admin)
        $owner = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->inRandomOrder()
            ->first();

        return [
            'customer_id' => $customer->id,
            'owner_id'    => $owner?->id ?? User::factory()->salesRep(),
            'title'       => $this->faker->catchPhrase(),
            'stage'       => $this->faker->randomElement(Opportunity::STAGES),
            'amount'      => $this->faker->randomFloat(2, 500, 250000),
            'close_date'  => $this->faker->dateTimeBetween('+7 days', '+6 months'),
            'probability' => $this->faker->numberBetween(5, 95),
            'source'      => $this->faker->randomElement(['referral','web','email','event','cold call']),
            'description' => $this->faker->sentence(12),
        ];
    }
}
