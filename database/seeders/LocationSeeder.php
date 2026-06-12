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
            'Jakarta',
            'Surabaya',
            'Bandung',
            'Medan',
            'Semarang',
            'Makassar',
            'Denpasar',
            'Surakarta',
            'Yogyakarta',
            'Balikpapan',
            'Samarinda',
        ];

        foreach ($locations as $location) {
            Location::firstOrCreate(['name' => $location]);
        }
    }
}
