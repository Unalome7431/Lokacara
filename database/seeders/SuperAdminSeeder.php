<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'velengio@gmail.com'],
            [
                'name' => 'Velengio Deriksen Charles',
                'password' => Hash::make('alenglokacara123'),
                'role' => 'super_admin',
                'suspended_at' => null,
            ]
        );
    }
}
