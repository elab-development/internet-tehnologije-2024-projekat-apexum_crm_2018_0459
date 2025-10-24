<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        $roles = User::ROLES; // ['admin','manager','sales_rep']

        return [
            'name'      => $this->faker->name(),
            'email'     => $this->faker->unique()->safeEmail(),
            'password'  => bcrypt('password'), // demo password
            'role'      => $this->faker->randomElement($roles),
            'image_url' => $this->faker->imageUrl(256, 256, 'people', true, 'user'),
        ];
    }

    public function admin(): self
    {
        return $this->state(fn() => ['role' => User::ROLE_ADMIN]);
    }

    public function manager(): self
    {
        return $this->state(fn() => ['role' => User::ROLE_MANAGER]);
    }

    public function salesRep(): self
    {
        return $this->state(fn() => ['role' => User::ROLE_SALES_REP]);
    }
}
