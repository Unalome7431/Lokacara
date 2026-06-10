<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use Database\Seeders\LocationSeeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(LocationSeeder::class);

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
            'Kuliah Umum: Relasi itu Penting',
            'Fintech Summit: Masa Depan Pembayaran Digital',
            'AI for Business: Otomasi Kerja dengan ChatGPT',
            'Kopdar Komunitas Ruby on Rails Indonesia',
            'Pelatihan Rajut Dasar: Membuat Syal Sendiri',
            'Workshop Kopi: Dari Biji hingga Secangkir Espresso',
            'Bazaar Makanan Tradisional Nusantara',
            'Seminar Keuangan: Bebas Finansial di Usia Muda',
            'Pameran Kerajinan Tangan Bahan Daur Ulang',
            'Intensive Bootcamp: Laravel 11 & Inertia React',
            'Web3 & NFT: Panduan Lengkap untuk Pemula',
            'Workshop Membuat Roti Sourdough di Rumah',
            'AI & Art: Membuat Lukisan Digital dengan Midjourney',
            'Talkshow Finansial: Cerdas Berinvestasi Saham & Reksadana',
            'Workshop Macrame: Seni Simpul Kreatif',
            'DevOps Essentials: CI/CD Pipeline dengan GitHub Actions',
            'Python for Data Science: Langkah Pertama Belajar AI',
            'Kopdar Food Blogger Jogja: Estetika Foto Makanan',
            'Pelatihan Keramik Tanah Liat: Membentuk Gelas Unik',
            'Workshop Pembuatan Website Portofolio Tanpa Coding',
            'Cyber Security Seminar: Melindungi Data Pribadi Anda',
            'Perencanaan Keuangan Keluarga di Era Inflasi',
            'Kelas Membuat Sushi Rumahan yang Higienis',
            'Kreasi Rajutan Amigurumi: Boneka Rajut Mini',
            'Workshop Cloud Computing: AWS vs Google Cloud',
            'Deep Learning: Membangun Object Detection Sendiri',
            'Seminar Crypto & Blockchain: Peluang dan Risiko',
            'Culinary Masterclass: Rahasia Sambal Khas Nusantara',
            'Workshop Paper Quilling: Seni Menggulung Kertas',
            'React Native vs Flutter: Mana yang Terbaik di 2026?',
            'Introduction to Machine Learning: Teori dan Praktik',
            'Peluang Bisnis Franchise Kuliner Modal Kecil',
            'Dekorasi Hantaran Pernikahan Kreatif',
            'Workshop Next.js 15: Optimasi Server Components',
            'Generative AI: Menulis Kode Program Lebih Cepat',
            'Strategi Pajak untuk UMKM dan Pekerja Lepas',
            'Workshop Pembuatan Lilin Aroma Terapi',
            'Healthy Food Challenge: Menu Diet Sehat Seminggu',
            'Workshop Git & GitHub: Kolaborasi Tim Lebih Mudah',
            'Computer Vision: Pengenalan Wajah dengan OpenCV',
            'Seminar Saham Syariah: Investasi Aman dan Berkah',
            'Teknik Mewarnai Batik Tulis Tradisional',
            'Cooking Demo: Makanan Penutup (Dessert) Kekinian',
            'Workshop Kubernetes: Orkestrasi Kontainer Skala Besar',
            'Membangun Model NLP Bahasa Indonesia dengan BERT',
            'Manajemen Portofolio Investasi untuk Pemula',
            'Workshop Clay Art: Membuat Aksesoris Cantik',
            'Festival Jajanan Pasar Legendaris',
            'Workshop UI Design: Membangun Design System',
            'AI Ethics: Dampak Sosial Kecerdasan Buatan',
            'Pelatihan Pembuatan Sabun Organik Ramah Lingkungan'
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
