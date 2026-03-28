<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        // owners allowed: manager or sales_rep
        $owner = User::query()
            ->whereIn('role', [User::ROLE_MANAGER, User::ROLE_SALES_REP])
            ->inRandomOrder()
            ->first();

        return [
            'owner_id' => $owner?->id ?? User::factory()->salesRep(),
            'name'     => $this->faker->company(),
            'email'    => $this->faker->unique()->companyEmail(),
            'phone'    => $this->faker->phoneNumber(),
            'website'  => $this->faker->domainName(),
            'industry' => $this->faker->randomElement(['Tech','Finance','Retail','Manufacturing','Health']),
            'address'  => $this->faker->address(),
            'image_url'=> $this->faker->imageUrl(384, 384, 'business', true, 'logo'),
            'notes'    => $this->faker->sentence(10),
        ];
    }
}
