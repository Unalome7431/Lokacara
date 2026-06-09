<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            'Surakarta',
            'Yogyakarta',
            'Semarang',
            'Jakarta',
            'Surabaya',
        ];

        foreach ($locations as $location) {
            Location::create(['name' => $location]);
        }
    }
}
