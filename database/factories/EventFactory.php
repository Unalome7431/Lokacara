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
        $eventTypePrefix = fake()->randomElement(['Seminar Nasional:', 'Workshop:', 'Volunteer:', 'Gathering:']);
        $startDate = fake()->dateTimeBetween('+1 days', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, $startDate->format('Y-m-d H:i:s').'+2 days');
        $type = fake()->randomElement(['online', 'offline']);

        return [
            'user_id'=> User::factory(),
            'category_id'=> Category::factory(),
            'type'=> $type,
            'title'=> "{$eventTypePrefix} Custom Event",
            'description'=> fake()->sentence(),
            
            'location_name'=> $type === 'offline' ? fake()->randomElement(['Auditorium Surakarta', 'Gedung Sate', 'Hotel Indonesia']) : null,
            'address'=> $type === 'offline' ? fake()->address() : null,
            'latitude'=> $type === 'offline' ? fake()->latitude() : null,
            'longitude'=> $type === 'offline' ? fake()->longitude() : null,
            
            'platform_name'=> $type === 'online' ? fake()->randomElement(['Zoom', 'Google Meet', 'Microsoft Teams']) : null,
            'link'=> $type === 'online' ? fake()->url() : null,

            'start_datetime'=> $startDate,
            'end_datetime'=> $endDate,
            'capacity'=> fake()->randomElement([50, 100, 250, null]),
            'view_count'=> fake()->numberBetween(0, 1000)
        ];
    }
}
