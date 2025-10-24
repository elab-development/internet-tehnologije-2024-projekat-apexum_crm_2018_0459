<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    public function definition(): array
    {
        $customer = Customer::query()->inRandomOrder()->first() ?? Customer::factory()->create();
        // Link to an opportunity of the same customer ~70% of the time
        $opportunity = Opportunity::query()->where('customer_id', $customer->id)->inRandomOrder()->first();
        if (!$opportunity && $this->faker->boolean(70)) {
            $opportunity = Opportunity::factory()->create(['customer_id' => $customer->id]);
        }

        $owner = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->inRandomOrder()
            ->first();

        return [
            'customer_id'    => $customer->id,
            'opportunity_id' => $this->faker->boolean(70) ? ($opportunity->id ?? null) : null,
            'owner_id'       => $owner?->id ?? User::factory()->salesRep(),
            'type'           => $this->faker->randomElement([Activity::TYPE_CALL, Activity::TYPE_EMAIL, Activity::TYPE_MEETING, Activity::TYPE_TASK]),
            'status'         => $this->faker->randomElement([Activity::STATUS_OPEN, Activity::STATUS_COMPLETED, Activity::STATUS_CANCELLED]),
            'subject'        => ucfirst($this->faker->words(3, true)),
            'due_at'         => $this->faker->optional()->dateTimeBetween('-1 week', '+1 month'),
            'notes'          => $this->faker->sentence(10),
        ];
    }
}
