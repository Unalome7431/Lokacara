<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Event;
use App\Models\Category;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $titles = [
            'Learning Labs: Crash Course for Frontend Developer',
            'GoGreen: Create a Breathable World',
            'Vokatif: Berbagi Takjil',
            'P!NGFEST: Artificial Intelligence in New Era',
            'Learning Labs: Crash Course for Backend Developer',
            'Learning Labs: UI/UX Crash Course using Figma',
            'Sui: Web2 to Web3 Revolutionary',
            'Solana: Intensive 2 Months Web3 Learning',
            'PMI: Donasi Darah',
            'Kuliah Umum: Relasi itu Penting'
        ];

        // CATEGORY
        $categories = collect([
            Category::factory()->create([
                'name'=> 'Teknologi',
                'slug'=> 'Teknologi',
            ]),
            Category::factory()->create([
                'name'=> 'Keuangan',
                'slug'=> 'Keuangan',
            ]),
            Category::factory()->create([
                'name'=> 'Artificial Intelligence',
                'slug'=> 'Artificial-Intelligence',
            ]),
            Category::factory()->create([
                'name'=> 'Makanan',
                'slug'=> 'Makanan',
            ]),
            Category::factory()->create([
                'name'=> 'Kerajinan Tangan',
                'slug'=> 'Kerajinan-Tangan',
            ])
        ]);

        // USERS
        $admin = User::factory()->create([
            'name' => 'Velengio Deriksen Charles',
            'email' => 'velengio@gmail.com',
            'password'=> 'tes1234567',
            'role'=> 'admin',
            'suspended_at'=> null
        ]);

        $dummyUsers = User::factory(10)->create();

        $allUser = $dummyUsers->concat([$admin]);

        // EVENTS
        foreach($titles as $title) {
            Event::factory()
                ->recycle($categories)
                ->recycle($allUser)
                ->create([
                    'title'=> $title
                ]);
        }

    }
}
