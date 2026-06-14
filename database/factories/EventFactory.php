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
        $eventTypePrefix = $this->faker->randomElement(['Seminar Nasional:', 'Workshop:', 'Volunteer:', 'Gathering:']);
        $startDate = $this->faker->dateTimeBetween('+1 days', '+1 month');
        $endDate = $this->faker->dateTimeBetween($startDate, $startDate->format('Y-m-d H:i:s').'+2 days');
        $type = $this->faker->randomElement(['online', 'offline']);

        return [
            'user_id'=> User::factory(),
            'category_id'=> Category::factory(),
            'type'=> $type,
            'title'=> "{$eventTypePrefix} Custom Event",
            'description'=> $this->faker->sentence(),
            'price'=> $this->faker->randomElement([0, 0, 0, 15000, 25000, 50000, 100000, null]),
            
            'location_name'=> $type === 'offline' ? $this->faker->randomElement(['Auditorium Surakarta', 'Gedung Sate', 'Hotel Indonesia']) : null,
            'address'=> $type === 'offline' ? $this->faker->address() : null,
            'latitude'=> $type === 'offline' ? $this->faker->latitude() : null,
            'longitude'=> $type === 'offline' ? $this->faker->longitude() : null,
            
            'platform_name'=> $type === 'online' ? $this->faker->randomElement(['Zoom', 'Google Meet', 'Microsoft Teams']) : null,
            'link'=> $type === 'online' ? $this->faker->url() : null,

            'start_datetime'=> $startDate,
            'end_datetime'=> $endDate,
            'capacity'=> $this->faker->randomElement([50, 100, 250, null]),
            'view_count'=> $this->faker->numberBetween(0, 1000)
        ];
    }
}
