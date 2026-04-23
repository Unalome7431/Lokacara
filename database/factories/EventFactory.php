<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $eventType = fake()->randomElement(['Seminar Nasional:', 'Workshop:', 'Volunteer:', 'Gathering:']);
        $startDate = fake()->dateTimeBetween('+1 days', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, $startDate->format('Y-m-d H:i:s').'+2 days');

        return [
            'user_id'=> User::factory(),
            'category_id'=> Category::factory(),
            'title'=> "{$eventType} Custom Event",
            'description'=> fake()->sentence(),
            'location_name'=> fake()->randomElement(['Surakarta', 'Jakarta', 'Tangerang', 'Pontianak', 'Yogyakarta', 'Bandung', 'Palembang', 'Surabaya', 'Semarang', 'Bali']),
            'latitude'=> fake()->latitude(),
            'longitude'=> fake()->longitude(),
            'start_datetime'=> $startDate,
            'end_datetime'=> $endDate,
            'capacity'=> fake()->randomElement([50, 100, 250, null]),
            'view_count'=> fake()->numberBetween(0, 1000)
        ];
    }
}
