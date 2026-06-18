<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Locations
        $this->call(LocationSeeder::class);

        // 2. Seed Categories
        $categories = collect([
            'Teknologi' => Category::factory()->create([
                'name' => 'Teknologi',
                'slug' => 'Teknologi',
            ]),
            'Keuangan' => Category::factory()->create([
                'name' => 'Keuangan',
                'slug' => 'Keuangan',
            ]),
            'Artificial Intelligence' => Category::factory()->create([
                'name' => 'Artificial Intelligence',
                'slug' => 'Artificial-Intelligence',
            ]),
            'Makanan' => Category::factory()->create([
                'name' => 'Makanan',
                'slug' => 'Makanan',
            ]),
            'Kerajinan Tangan' => Category::factory()->create([
                'name' => 'Kerajinan Tangan',
                'slug' => 'Kerajinan-Tangan',
            ]),
        ]);

        // 3. Seed Users
        $superAdmin = User::factory()->create([
            'name' => 'Velengio Deriksen Charles',
            'email' => 'velengio@gmail.com',
            'password' => 'tes1234567',
            'role' => 'super_admin',
            'suspended_at' => null,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin Lokacara',
            'email' => 'admin@gmail.com',
            'password' => 'tes1234567',
            'role' => 'admin',
            'suspended_at' => null,
        ]);

        $dummyUsers = User::factory(10)->create();
        $allUsers = $dummyUsers->concat([$superAdmin, $admin]);

        // 4. Pool of 120 Real-World Venues in Indonesia with Precise GPS Coordinates
        $venues = [
            // Yogyakarta (10)
            [
                'name' => 'Gadjah Mada University Club Hotel',
                'address' => 'Jl. Pancasila No.2, Bulaksumur, Yogyakarta, 55281',
                'latitude' => -7.77020000,
                'longitude' => 110.37780000,
            ],
            [
                'name' => 'Auditorium Universitas Negeri Yogyakarta',
                'address' => 'Jl. Kolombo No.1, Karangmalang, Yogyakarta, 55281',
                'latitude' => -7.77350000,
                'longitude' => 110.38680000,
            ],
            [
                'name' => 'Plaza Ambarrukmo (Main Atrium)',
                'address' => 'Jl. Laksda Adisucipto No.80, Sleman, Yogyakarta, 55281',
                'latitude' => -7.78280000,
                'longitude' => 110.40120000,
            ],
            [
                'name' => 'Sahid Jaya Hotel & Convention',
                'address' => 'Jl. Babarsari No.2, Depok, Sleman, Yogyakarta, 55281',
                'latitude' => -7.77940000,
                'longitude' => 110.41580000,
            ],
            [
                'name' => 'Malioboro Mall',
                'address' => 'Jl. Malioboro No.52-58, Yogyakarta, 55213',
                'latitude' => -7.79400000,
                'longitude' => 110.36620000,
            ],
            [
                'name' => 'Fort Vredeburg Museum',
                'address' => 'Jl. Margo Mulyo No.6, Ngupasan, Yogyakarta, 55122',
                'latitude' => -7.80020000,
                'longitude' => 110.36630000,
            ],
            [
                'name' => 'Yogyakarta Presidential Palace (Gedung Agung)',
                'address' => 'Jl. Ahmad Yani, Ngupasan, Yogyakarta, 55122',
                'latitude' => -7.80120000,
                'longitude' => 110.36470000,
            ],
            [
                'name' => 'Taman Pintar Yogyakarta',
                'address' => 'Jl. Panembahan Senopati No.1-3, Yogyakarta, 55121',
                'latitude' => -7.80090000,
                'longitude' => 110.36850000,
            ],
            [
                'name' => 'Jogja Expo Center (JEC)',
                'address' => 'Jl. Raya Janti, Banguntapan, Bantul, Yogyakarta, 55198',
                'latitude' => -7.79890000,
                'longitude' => 110.40790000,
            ],
            [
                'name' => 'The Phoenix Hotel Yogyakarta',
                'address' => 'Jl. Jend. Sudirman No.9, Yogyakarta, 55233',
                'latitude' => -7.78270000,
                'longitude' => 110.36810000,
            ],

            // Surakarta / Solo (10)
            [
                'name' => 'Auditorium Universitas Sebelas Maret (UNS)',
                'address' => 'Jl. Ir. Sutami No.36A, Kentingan, Surakarta, 57126',
                'latitude' => -7.55890000,
                'longitude' => 110.85620000,
            ],
            [
                'name' => 'Solo Paragon Mall (Grand Atrium)',
                'address' => 'Jl. Yosodipuro No.133, Mangkubumen, Surakarta, 57139',
                'latitude' => -7.56120000,
                'longitude' => 110.81520000,
            ],
            [
                'name' => 'De Tjolomadoe Convention Hall',
                'address' => 'Jl. Adi Sucipto No.1, Paulan, Karanganyar, Surakarta, 57176',
                'latitude' => -7.53980000,
                'longitude' => 110.75840000,
            ],
            [
                'name' => 'Keraton Surakarta Hadiningrat',
                'address' => 'Baluwarti, Pasar Kliwon, Surakarta, 57144',
                'latitude' => -7.57780000,
                'longitude' => 110.82940000,
            ],
            [
                'name' => 'Pura Mangkunegaran Solo',
                'address' => 'Jl. Ronggowarsito, Keprabon, Banjarsari, Surakarta, 57131',
                'latitude' => -7.56680000,
                'longitude' => 110.82340000,
            ],
            [
                'name' => 'The Sunan Hotel Solo',
                'address' => 'Jl. A. Yani No.145, Kerten, Laweyan, Surakarta, 57143',
                'latitude' => -7.55590000,
                'longitude' => 110.79580000,
            ],
            [
                'name' => 'Solo Grand Mall (Atrium)',
                'address' => 'Jl. Slamet Riyadi No.273, Penumping, Laweyan, Surakarta, 57141',
                'latitude' => -7.56230000,
                'longitude' => 110.80670000,
            ],
            [
                'name' => 'Alila Solo Hotel Ballroom',
                'address' => 'Jl. Slamet Riyadi No.562, Jajar, Laweyan, Surakarta, 57144',
                'latitude' => -7.55830000,
                'longitude' => 110.79090000,
            ],
            [
                'name' => 'Tirtonadi Convention Hall',
                'address' => 'Gilingan, Banjarsari, Surakarta, 57134',
                'latitude' => -7.54950000,
                'longitude' => 110.82080000,
            ],
            [
                'name' => 'Lorin Solo Hotel & Resort',
                'address' => 'Jl. Adi Sucipto No.47, Karanganyar, Surakarta, 57174',
                'latitude' => -7.54580000,
                'longitude' => 110.77880000,
            ],

            // Jakarta (20)
            [
                'name' => 'Gelora Bung Karno Main Stadium',
                'address' => 'Jl. Pintu Satu Senayan, Gelora, Tanah Abang, Jakarta Pusat, 10270',
                'latitude' => -6.21860000,
                'longitude' => 106.80260000,
            ],
            [
                'name' => 'Jakarta Convention Center (JCC)',
                'address' => 'Jl. Gatot Subroto, Gelora, Tanah Abang, Jakarta Pusat, 10270',
                'latitude' => -6.21480000,
                'longitude' => 106.80770000,
            ],
            [
                'name' => 'Grand Indonesia Mall Atrium',
                'address' => 'Jl. M.H. Thamrin No.1, Kebon Melati, Tanah Abang, Jakarta Pusat, 10310',
                'latitude' => -6.19520000,
                'longitude' => 106.82290000,
            ],
            [
                'name' => 'Plaza Indonesia Exhibition Hall',
                'address' => 'Jl. M.H. Thamrin No.Kav. 28-30, Gondangdia, Menteng, Jakarta Pusat, 10350',
                'latitude' => -6.19420000,
                'longitude' => 106.82260000,
            ],
            [
                'name' => 'Monumen Nasional (Monas) Park',
                'address' => 'Gambir, Kecamatan Gambir, Kota Jakarta Pusat, 10110',
                'latitude' => -6.17540000,
                'longitude' => 106.82720000,
            ],
            [
                'name' => 'The Ritz-Carlton Mega Kuningan',
                'address' => 'Jl. DR. Ide Anak Agung Gde Agung Kav. E.1.1, Kuningan Timur, Setiabudi, Jakarta Selatan, 12950',
                'latitude' => -6.22890000,
                'longitude' => 106.82710000,
            ],
            [
                'name' => 'Shangri-La Hotel Jakarta Ballroom',
                'address' => 'Kota BNI, Jl. Jend. Sudirman Kav. 1, Karet Tengsin, Tanah Abang, Jakarta Pusat, 10220',
                'latitude' => -6.20230000,
                'longitude' => 106.81970000,
            ],
            [
                'name' => 'Universitas Indonesia (UI) Balairung',
                'address' => 'Jl. Lingkar Kampus UI, Pondok Cina, Beji, Depok/Jakarta, 16424',
                'latitude' => -6.36060000,
                'longitude' => 106.82730000,
            ],
            [
                'name' => 'Bina Nusantara (Binus) University Anggrek Campus',
                'address' => 'Jl. Kebon Jeruk Raya No.27, Kebon Jeruk, Jakarta Barat, 11530',
                'latitude' => -6.20180000,
                'longitude' => 106.78160000,
            ],
            [
                'name' => 'Pacific Place Mall Ballroom',
                'address' => 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan, 12190',
                'latitude' => -6.22440000,
                'longitude' => 106.80970000,
            ],
            [
                'name' => 'JIExpo Kemayoran (Jakarta International Expo)',
                'address' => 'Jl. H. Benyamin Sueb, Pademangan Timur, Pademangan, Jakarta Utara, 14410',
                'latitude' => -6.14980000,
                'longitude' => 106.84880000,
            ],
            [
                'name' => 'Hotel Indonesia Kempinski Ballroom',
                'address' => 'Jl. M.H. Thamrin No.1, Menteng, Kota Jakarta Pusat, 10310',
                'latitude' => -6.19550000,
                'longitude' => 106.82400000,
            ],
            [
                'name' => 'Pullman Jakarta Central Park',
                'address' => 'Podomoro City, Jl. Letjen S. Parman Kav. 28, Grogol Petamburan, Jakarta Barat, 11470',
                'latitude' => -6.17720000,
                'longitude' => 106.79040000,
            ],
            [
                'name' => 'Gandaria City Mall (Piazza)',
                'address' => 'Jl. Sultan Iskandar Muda, Kebayoran Lama Utara, Kebayoran Lama, Jakarta Selatan, 12240',
                'latitude' => -6.24420000,
                'longitude' => 106.78380000,
            ],
            [
                'name' => 'Kota Kasablanka (Kasablanka Hall)',
                'address' => 'Jl. Casablanca No.Kav. 88, Menteng Dalam, Tebet, Jakarta Selatan, 12870',
                'latitude' => -6.22380000,
                'longitude' => 106.84280000,
            ],
            [
                'name' => 'Senayan City (The Hall)',
                'address' => 'Jl. Asia Afrika No.19, Gelora, Tanah Abang, Jakarta Pusat, 10270',
                'latitude' => -6.22740000,
                'longitude' => 106.79740000,
            ],
            [
                'name' => 'Lotte Shopping Avenue (Ice Palace)',
                'address' => 'Jl. Prof. DR. Satrio No.Kav 3-5, Karet Kuningan, Setiabudi, Jakarta Selatan, 12940',
                'latitude' => -6.22410000,
                'longitude' => 106.82560000,
            ],
            [
                'name' => 'Fairmont Jakarta Ballroom',
                'address' => 'Jl. Asia Afrika No.8, Gelora, Tanah Abang, Jakarta Pusat, 10270',
                'latitude' => -6.21950000,
                'longitude' => 106.80140000,
            ],
            [
                'name' => 'DoubleTree by Hilton Jakarta - Diponegoro',
                'address' => 'Jl. Pegangsaan Timur No.17, Cikini, Menteng, Jakarta Pusat, 10310',
                'latitude' => -6.19830000,
                'longitude' => 106.84370000,
            ],
            [
                'name' => 'Central Park Mall (Eco Sky Walk)',
                'address' => 'Jl. Letjen S. Parman Kav. 28, Tanjung Duren Selatan, Grogol Petamburan, Jakarta Barat, 11470',
                'latitude' => -6.17740000,
                'longitude' => 106.79250000,
            ],

            // Bandung (15)
            [
                'name' => 'Institut Teknologi Bandung (ITB) Aula Barat',
                'address' => 'Jl. Ganesha No.10, Lebak Siliwangi, Coblong, Bandung, 40132',
                'latitude' => -6.89150000,
                'longitude' => 107.61070000,
            ],
            [
                'name' => 'Gedung Sate Bandung',
                'address' => 'Jl. Diponegoro No.22, Citarum, Bandung Wetan, Bandung, 40115',
                'latitude' => -6.90250000,
                'longitude' => 107.61880000,
            ],
            [
                'name' => 'Trans Studio Mall Bandung Convention',
                'address' => 'Jl. Gatot Subroto No.289, Cibangkong, Batununggal, Bandung, 40273',
                'latitude' => -6.92540000,
                'longitude' => 107.63660000,
            ],
            [
                'name' => 'Cihampelas Walk (Ciwalk Atrium)',
                'address' => 'Jl. Cihampelas No.160, Cipaganti, Coblong, Bandung, 40131',
                'latitude' => -6.89380000,
                'longitude' => 107.60410000,
            ],
            [
                'name' => 'Paris Van Java (PVJ Mall)',
                'address' => 'Jl. Sukajadi No.131-139, Cipedes, Sukajadi, Bandung, 40162',
                'latitude' => -6.88970000,
                'longitude' => 107.59590000,
            ],
            [
                'name' => 'Universitas Padjadjaran (UNPAD) Dipatiukur',
                'address' => 'Jl. Dipati Ukur No.35, Lebakgede, Coblong, Bandung, 40132',
                'latitude' => -6.89230000,
                'longitude' => 107.61830000,
            ],
            [
                'name' => 'Grand Hotel Preanger Bandung',
                'address' => 'Jl. Asia Afrika No.81, Braga, Sumur Bandung, Bandung, 40111',
                'latitude' => -6.92160000,
                'longitude' => 107.61250000,
            ],
            [
                'name' => 'Savoy Homann Bidakara Hotel',
                'address' => 'Jl. Asia Afrika No.112, Cikawao, Lengkong, Bandung, 40261',
                'latitude' => -6.92130000,
                'longitude' => 107.61050000,
            ],
            [
                'name' => 'Saung Angklung Udjo',
                'address' => 'Jl. Padasuka No.118, Pasirlayung, Cibeunying Kidul, Bandung, 40192',
                'latitude' => -6.89790000,
                'longitude' => 107.65470000,
            ],
            [
                'name' => 'Hilton Bandung Ballroom',
                'address' => 'Jl. H.O.S. Cokroaminoto No.41-43, Arjuna, Cicendo, Bandung, 40172',
                'latitude' => -6.91420000,
                'longitude' => 107.60060000,
            ],
            [
                'name' => 'Harris Hotel & Conventions Festival Citylink',
                'address' => 'Jl. Peta No.241, Suka Asih, Bojongloa Kaler, Bandung, 40242',
                'latitude' => -6.93620000,
                'longitude' => 107.59120000,
            ],
            [
                'name' => 'Pullman Bandung Grand Central Ballroom',
                'address' => 'Jl. Diponegoro No.27, Citarum, Bandung Wetan, Bandung, 40115',
                'latitude' => -6.90190000,
                'longitude' => 107.61910000,
            ],
            [
                'name' => 'Universitas Pendidikan Indonesia (UPI) Gymnasium',
                'address' => 'Jl. Dr. Setiabudi No.229, Isola, Sukasari, Bandung, 40154',
                'latitude' => -6.86110000,
                'longitude' => 107.59440000,
            ],
            [
                'name' => 'Telkom University Convention Hall',
                'address' => 'Jl. Telekomunikasi Terusan Buah Batu, Dayeuhkolot, Bandung, 40257',
                'latitude' => -6.97400000,
                'longitude' => 107.63050000,
            ],
            [
                'name' => 'NuArt Sculpture Park',
                'address' => 'Jl. Setraduta Raya No.L-6, Sarijadi, Sukasari, Bandung, 40151',
                'latitude' => -6.87780000,
                'longitude' => 107.57610000,
            ],

            // Surabaya (15)
            [
                'name' => 'Tunjungan Plaza Convention Hall',
                'address' => 'Jl. Jenderal Basuki Rahmat No.8-12, Kedungdoro, Tegalsari, Surabaya, 60261',
                'latitude' => -7.26180000,
                'longitude' => 112.73830000,
            ],
            [
                'name' => 'Universitas Airlangga (UNAIR) Kampus C Auditorium',
                'address' => 'Jl. Mulyorejo, Mulyorejo, Surabaya, 60115',
                'latitude' => -7.26780000,
                'longitude' => 112.78420000,
            ],
            [
                'name' => 'Institut Teknologi Sepuluh Nopember (ITS) Graha Sepuluh Nopember',
                'address' => 'Jl. Raya ITS, Keputih, Sukolilo, Surabaya, 60111',
                'latitude' => -7.28240000,
                'longitude' => 112.79490000,
            ],
            [
                'name' => 'Dyandra Convention Center Surabaya',
                'address' => 'Jl. Raya Gubeng No.4, Gubeng, Surabaya, 60281',
                'latitude' => -7.26250000,
                'longitude' => 112.74450000,
            ],
            [
                'name' => 'Grand City Surabaya Exhibition Hall',
                'address' => 'Jl. Walikota Mustajab, Ketabang, Genteng, Surabaya, 60272',
                'latitude' => -7.26310000,
                'longitude' => 112.74950000,
            ],
            [
                'name' => 'Pakuwon Mall (Pakuwon Imperial Ballroom)',
                'address' => 'Jl. Puncak Indah Lontar No.2, Babatan, Wiyung, Surabaya, 60227',
                'latitude' => -7.29120000,
                'longitude' => 112.67570000,
            ],
            [
                'name' => 'Ciputra World Surabaya Ballroom',
                'address' => 'Jl. Mayjen Sungkono No.89, Gunungsari, Dukuh Pakis, Surabaya, 60224',
                'latitude' => -7.29170000,
                'longitude' => 112.71610000,
            ],
            [
                'name' => 'Bumi Surabaya City Resort',
                'address' => 'Jl. Jenderal Basuki Rahmat No.106-128, Embong Kaliasin, Genteng, Surabaya, 60271',
                'latitude' => -7.26740000,
                'longitude' => 112.74080000,
            ],
            [
                'name' => 'JW Marriott Hotel Surabaya Ballroom',
                'address' => 'Jl. Embong Malang No.85-89, Kedungdoro, Tegalsari, Surabaya, 60261',
                'latitude' => -7.25920000,
                'longitude' => 112.73690000,
            ],
            [
                'name' => 'Sheraton Surabaya Hotel & Towers',
                'address' => 'Jl. Embong Malang No.25-31, Kedungdoro, Tegalsari, Surabaya, 60261',
                'latitude' => -7.26260000,
                'longitude' => 112.73970000,
            ],
            [
                'name' => 'Universitas Kristen Petra Auditorium',
                'address' => 'Jl. Siwalankerto No.121-131, Siwalankerto, Wonocolo, Surabaya, 60236',
                'latitude' => -7.33940000,
                'longitude' => 112.73750000,
            ],
            [
                'name' => 'House of Sampoerna Museum',
                'address' => 'Taman Sampoerna No.6, Krembangan Utara, Krembangan, Surabaya, 60163',
                'latitude' => -7.23080000,
                'longitude' => 112.73420000,
            ],
            [
                'name' => 'Galaxy Mall Surabaya Atrium',
                'address' => 'Jl. Dharmahusada Indah Timur No.35-37, Mulyorejo, Surabaya, 60115',
                'latitude' => -7.26790000,
                'longitude' => 112.78360000,
            ],
            [
                'name' => 'Shangri-La Hotel Surabaya Ballroom',
                'address' => 'Jl. Mayjen Sungkono No.120, Pakis, Sawahan, Surabaya, 60256',
                'latitude' => -7.28920000,
                'longitude' => 112.72080000,
            ],
            [
                'name' => 'DoubleTree by Hilton Surabaya Ballroom',
                'address' => 'Jl. Tunjungan No.12, Genteng, Surabaya, 60275',
                'latitude' => -7.26420000,
                'longitude' => 112.74240000,
            ],

            // Semarang (10)
            [
                'name' => 'Simpang Lima Semarang Park',
                'address' => 'Pleburan, Semarang Selatan, Kota Semarang, 50241',
                'latitude' => -6.99030000,
                'longitude' => 110.42290000,
            ],
            [
                'name' => 'Lawang Sewu Historic Site',
                'address' => 'Jl. Pemuda, Sekayu, Semarang Tengah, Kota Semarang, 50132',
                'latitude' => -6.98410000,
                'longitude' => 110.41040000,
            ],
            [
                'name' => 'Universitas Diponegoro (UNDIP) Tembalang Auditorium',
                'address' => 'Jl. Prof. Sudarto, Tembalang, Kota Semarang, 50275',
                'latitude' => -7.04940000,
                'longitude' => 110.43940000,
            ],
            [
                'name' => 'PO Hotel Semarang Ballroom',
                'address' => 'Jl. Pemuda No.118, Sekayu, Semarang Tengah, Kota Semarang, 50132',
                'latitude' => -6.98360000,
                'longitude' => 110.41580000,
            ],
            [
                'name' => 'Hotel Ciputra Semarang Ballroom',
                'address' => 'Jl. Simpang Lima No.1, Pekunden, Semarang Tengah, Kota Semarang, 50134',
                'latitude' => -6.99010000,
                'longitude' => 110.42390000,
            ],
            [
                'name' => 'Masjid Agung Jawa Tengah (MAJT)',
                'address' => 'Jl. Gajah Raya, Sambirejo, Gayamsari, Kota Semarang, 50166',
                'latitude' => -6.98060000,
                'longitude' => 110.44490000,
            ],
            [
                'name' => 'Sam Poo Kong Temple Complex',
                'address' => 'Jl. Simongan No.129, Bongsari, Semarang Barat, Kota Semarang, 50148',
                'latitude' => -6.99620000,
                'longitude' => 110.39810000,
            ],
            [
                'name' => 'Patra Semarang Hotel & Convention',
                'address' => 'Jl. Sisingamangaraja, Candi, Gajahmungkur, Kota Semarang, 50252',
                'latitude' => -7.02290000,
                'longitude' => 110.43080000,
            ],
            [
                'name' => 'DP Mall Semarang (Atrium)',
                'address' => 'Jl. Pemuda No.150, Sekayu, Semarang Tengah, Kota Semarang, 50132',
                'latitude' => -6.98440000,
                'longitude' => 110.41320000,
            ],
            [
                'name' => 'Universitas Negeri Semarang (UNNES) Auditorium',
                'address' => 'Sekaran, Gunung Pati, Kota Semarang, 50229',
                'latitude' => -7.04830000,
                'longitude' => 110.40720000,
            ],

            // Bali (10)
            [
                'name' => 'Garuda Wisnu Kencana (GWK) Cultural Park',
                'address' => 'Jl. Raya Uluwatu, Ungasan, Kuta Selatan, Badung, Bali, 80364',
                'latitude' => -8.81040000,
                'longitude' => 115.16760000,
            ],
            [
                'name' => 'Discovery Shopping Mall Kuta Atrium',
                'address' => 'Jl. Kartika Plaza, Tuban, Kuta, Badung, Bali, 80361',
                'latitude' => -8.72970000,
                'longitude' => 115.16640000,
            ],
            [
                'name' => 'Beachwalk Shopping Center Atrium',
                'address' => 'Jl. Pantai Kuta, Kuta, Badung, Bali, 80361',
                'latitude' => -8.71710000,
                'longitude' => 115.16870000,
            ],
            [
                'name' => 'Universitas Udayana (UNUD) Jimbaran Auditorium',
                'address' => 'Jl. Kampus Udayana, Jimbaran, Kuta Selatan, Badung, Bali, 80361',
                'latitude' => -8.79840000,
                'longitude' => 115.17290000,
            ],
            [
                'name' => 'Bali International Convention Centre (BICC) Nusa Dua',
                'address' => 'Kawasan Pariwisata Nusa Dua BTDC Lot N-3, Benoa, Kuta Selatan, Badung, Bali, 80363',
                'latitude' => -8.79950000,
                'longitude' => 115.22850000,
            ],
            [
                'name' => 'Bali Nusa Dua Convention Center (BNDCC)',
                'address' => 'Kawasan Terintegrasi ITDC NW/1, Nusa Dua, Kuta Selatan, Badung, Bali, 80363',
                'latitude' => -8.80280000,
                'longitude' => 115.22550000,
            ],
            [
                'name' => 'W Bali - Seminyak Ballroom',
                'address' => 'Jl. Petitenget, Kerobokan Kelod, Kuta Utara, Badung, Bali, 80361',
                'latitude' => -8.67970000,
                'longitude' => 115.14810000,
            ],
            [
                'name' => 'Hard Rock Hotel Bali (Hall)',
                'address' => 'Jl. Pantai Kuta, Banjar Pande Mas, Kuta, Badung, Bali, 80361',
                'latitude' => -8.72260000,
                'longitude' => 115.16910000,
            ],
            [
                'name' => 'Taman Werdhi Budaya Art Center Denpasar',
                'address' => 'Jl. Nusa Indah No.1, Sumerta Kelod, Denpasar Timur, Denpasar, Bali, 80239',
                'latitude' => -8.65750000,
                'longitude' => 115.23340000,
            ],
            [
                'name' => 'Plaza Renon Denpasar Atrium',
                'address' => 'Jl. Raya Puputan, Renon, Denpasar Selatan, Denpasar, Bali, 80226',
                'latitude' => -8.67630000,
                'longitude' => 115.23480000,
            ],

            // Medan (10)
            [
                'name' => 'Sun Plaza Medan (Atrium)',
                'address' => 'Jl. H. Zainul Arifin No.7, Madras Hulu, Medan Polonia, Medan, 20152',
                'latitude' => 3.58660000,
                'longitude' => 98.67180000,
            ],
            [
                'name' => 'Centre Point Mall Medan Atrium',
                'address' => 'Jl. Jawa No.8, Gang Buntu, Medan Timur, Medan, 20231',
                'latitude' => 3.59250000,
                'longitude' => 98.68110000,
            ],
            [
                'name' => 'Universitas Sumatera Utara (USU) Auditorium',
                'address' => 'Jl. Dr. T. Mansur No.9, Padang Bulan, Medan Baru, Medan, 20155',
                'latitude' => 3.56290000,
                'longitude' => 98.65620000,
            ],
            [
                'name' => 'Istana Maimun Historic Plaza',
                'address' => 'Jl. Brigjend Katamso No.66, Aur, Medan Maimun, Medan, 20151',
                'latitude' => 3.57520000,
                'longitude' => 98.68410000,
            ],
            [
                'name' => 'JW Marriott Hotel Medan Ballroom',
                'address' => 'Jl. Putri Hijau No.10, Kesawan, Medan Barat, Medan, 20111',
                'latitude' => 3.59660000,
                'longitude' => 98.67750000,
            ],
            [
                'name' => 'Grand City Hall Medan Ballroom',
                'address' => 'Jl. Balai Kota No.1, Kesawan, Medan Barat, Medan, 20112',
                'latitude' => 3.59190000,
                'longitude' => 98.67720000,
            ],
            [
                'name' => 'Cambridge City Square Atrium',
                'address' => 'Jl. S. Parman No.250, Petisah Tengah, Medan Petisah, Medan, 20112',
                'latitude' => 3.58550000,
                'longitude' => 98.66590000,
            ],
            [
                'name' => 'Santika Premiere Dyandra Hotel Medan Ballroom',
                'address' => 'Jl. Kapten Maulana Lubis No.7, Petisah Tengah, Medan Petisah, Medan, 20112',
                'latitude' => 3.58980000,
                'longitude' => 98.67320000,
            ],
            [
                'name' => 'Medan International Convention Center (MICC)',
                'address' => 'Jl. Ring Road No.92, Sei Sikambing B, Medan Sunggal, Medan, 20123',
                'latitude' => 3.58880000,
                'longitude' => 98.60870000,
            ],
            [
                'name' => 'Universitas Muhammadiyah Sumatera Utara (UMSU) Hall',
                'address' => 'Jl. Kapten Mukhtar Basri No.3, Glugur Darat II, Medan Timur, Medan, 20238',
                'latitude' => 3.61520000,
                'longitude' => 98.67480000,
            ],

            // Makassar (10)
            [
                'name' => 'Phinisi Point Mall (Atrium)',
                'address' => 'Jl. Metro Tanjung Bunga No.2, Panambungan, Mariso, Makassar, 90112',
                'latitude' => -5.15840000,
                'longitude' => 119.40250000,
            ],
            [
                'name' => 'Trans Studio Mall Makassar Convention',
                'address' => 'Jl. Metro Tanjung Bunga, Maccini Sombala, Tamalate, Makassar, 90224',
                'latitude' => -5.15780000,
                'longitude' => 119.38810000,
            ],
            [
                'name' => 'Universitas Hasanuddin (UNHAS) Baruga AP Pettarani',
                'address' => 'Jl. Perintis Kemerdekaan Km.10, Tamalanrea Indah, Tamalanrea, Makassar, 90245',
                'latitude' => -5.13280000,
                'longitude' => 119.48910000,
            ],
            [
                'name' => 'Fort Rotterdam Makassar Plaza',
                'address' => 'Jl. Ujung Pandang, Bulogading, Ujung Pandang, Makassar, 90111',
                'latitude' => -5.13390000,
                'longitude' => 119.40470000,
            ],
            [
                'name' => 'Pantai Losari Pavilion',
                'address' => 'Jl. Penghibur, Maloku, Ujung Pandang, Makassar, 90111',
                'latitude' => -5.14440000,
                'longitude' => 119.40570000,
            ],
            [
                'name' => 'Claro Hotel Makassar Ballroom',
                'address' => 'Jl. A. P. Pettarani No.3, Mannuruki, Tamalate, Makassar, 90221',
                'latitude' => -5.16110000,
                'longitude' => 119.43280000,
            ],
            [
                'name' => 'Gammara Hotel Makassar Ballroom',
                'address' => 'Jl. Metro Tanjung Bunga, Kunjung Mae, Mariso, Makassar, 90121',
                'latitude' => -5.15940000,
                'longitude' => 119.40180000,
            ],
            [
                'name' => 'Universitas Negeri Makassar (UNM) Phinisi Tower Hall',
                'address' => 'Jl. A. P. Pettarani, Tidung, Rappocini, Makassar, 90222',
                'latitude' => -5.18560000,
                'longitude' => 119.43440000,
            ],
            [
                'name' => 'Mal Ratu Indah Makassar Atrium',
                'address' => 'Jl. Dr. Ratulangi No.35, Mamajang Luar, Mamajang, Makassar, 90132',
                'latitude' => -5.15390000,
                'longitude' => 119.41690000,
            ],
            [
                'name' => 'Nipah Mall Makassar Atrium',
                'address' => 'Jl. Urip Sumoharjo, Panaikang, Panakkukang, Makassar, 90231',
                'latitude' => -5.13740000,
                'longitude' => 119.44470000,
            ],

            // Balikpapan & Samarinda (10)
            [
                'name' => 'Plaza Balikpapan Atrium',
                'address' => 'Jl. Jenderal Sudirman No.1, Klandasan Ilir, Balikpapan Kota, Balikpapan, 76113',
                'latitude' => -1.27580000,
                'longitude' => 116.82940000,
            ],
            [
                'name' => 'E-Walk Balikpapan Superblock',
                'address' => 'Jl. Jenderal Sudirman No.47, Damai, Balikpapan Kota, Balikpapan, 76114',
                'latitude' => -1.26420000,
                'longitude' => 116.85840000,
            ],
            [
                'name' => 'Grand Senyiur Hotel Balikpapan Ballroom',
                'address' => 'Jl. ARS Mohammad No.7, Klandasan Ulu, Balikpapan Kota, Balikpapan, 76112',
                'latitude' => -1.26620000,
                'longitude' => 116.83780000,
            ],
            [
                'name' => 'Universitas Mulawarman (UNMUL) Samarinda Auditorium',
                'address' => 'Jl. Kuaro, Gunung Kelua, Samarinda Ulu, Samarinda, 75119',
                'latitude' => -0.47050000,
                'longitude' => 117.15280000,
            ],
            [
                'name' => 'Big Mall Samarinda (Atrium)',
                'address' => 'Jl. Untung Suropati No.8, Karang Asam Ulu, Sungai Kunjang, Samarinda, 75126',
                'latitude' => -0.52180000,
                'longitude' => 117.11740000,
            ],
            [
                'name' => 'Swiss-Belhotel Balikpapan Ballroom',
                'address' => 'Jl. Jenderal Sudirman, Klandasan Ilir, Balikpapan Kota, Balikpapan, 76113',
                'latitude' => -1.27890000,
                'longitude' => 116.83090000,
            ],
            [
                'name' => 'Platinum Balikpapan Hotel & Convention Hall',
                'address' => 'Jl. Soekarno Hatta No.28, Graha Indah, Balikpapan Utara, Balikpapan, 76124',
                'latitude' => -1.22680000,
                'longitude' => 116.85890000,
            ],
            [
                'name' => 'Plaza Mulia Samarinda Atrium',
                'address' => 'Jl. Bhayangkara No.58, Bugis, Samarinda Kota, Samarinda, 75121',
                'latitude' => -0.48980000,
                'longitude' => 117.14720000,
            ],
            [
                'name' => 'Aston Samarinda Hotel & Convention Hall',
                'address' => 'Jl. Pangeran Hidayatullah No.1, Pelabuhan, Samarinda Kota, Samarinda, 75112',
                'latitude' => -0.50190000,
                'longitude' => 117.15110000,
            ],
            [
                'name' => 'Dome Balikpapan (Balikpapan Sport and Convention Center)',
                'address' => 'Jl. Ruhui Rahayu I, Sepinggan Baru, Balikpapan Selatan, Balikpapan, 76115',
                'latitude' => -1.23980000,
                'longitude' => 116.87780000,
            ],
        ];

        // 5. Pool of 105 Real-World Event Templates (21 for each of the 5 categories)
        $eventsData = [
            // Category: Teknologi (21)
            [
                'title' => 'Indonesia Developer Summit 2026',
                'category' => 'Teknologi',
                'description' => 'Konferensi developer terbesar di Indonesia yang menghadirkan pakar teknologi dunia untuk membahas tren software engineering terbaru, cloud native, dan arsitektur web modern.',
            ],
            [
                'title' => 'PHP Indonesia Conference',
                'category' => 'Teknologi',
                'description' => 'Temu tahunan komunitas pengembang PHP di Indonesia dengan workshop teknis seputar Laravel, Symfony, optimasi performa database, dan PHP 8.x/9.x.',
            ],
            [
                'title' => 'Javascript Conference Jakarta',
                'category' => 'Teknologi',
                'description' => 'Konferensi khusus ekosistem JavaScript (Node.js, React, Next.js, Vue) yang membagikan praktik terbaik pengembangan frontend dan backend berskala besar.',
            ],
            [
                'title' => 'Laravel & Inertia.js Workshop',
                'category' => 'Teknologi',
                'description' => 'Workshop intensif membangun aplikasi web interaktif menggunakan Laravel 11, Inertia React, dan Tailwind CSS dari awal hingga siap dideploy.',
            ],
            [
                'title' => 'Docker & Kubernetes Hands-on',
                'category' => 'Teknologi',
                'description' => 'Pelatihan praktis tentang kontainerisasi aplikasi dengan Docker dan pengelolaan skala kontainer menggunakan orkestrasi Kubernetes di production.',
            ],
            [
                'title' => 'Web Security & Hacking Defense Workshop',
                'category' => 'Teknologi',
                'description' => 'Belajar dasar-dasar keamanan siber, penetration testing, serta cara mendeteksi dan mengamankan aplikasi web dari serangan OWASP Top 10.',
            ],
            [
                'title' => 'Go & Microservices Masterclass',
                'category' => 'Teknologi',
                'description' => 'Membangun sistem microservices berkinerja tinggi menggunakan bahasa pemrograman Go (Golang), gRPC, Kafka, dan arsitektur event-driven.',
            ],
            [
                'title' => 'Vue.js & Nuxt.js Frontend Meetup',
                'category' => 'Teknologi',
                'description' => 'Kopdar dan sharing session seputar pengembangan frontend menggunakan Vue 3 Composition API dan optimasi SEO menggunakan framework Nuxt.',
            ],
            [
                'title' => 'Next.js 15 Server Actions Seminar',
                'category' => 'Teknologi',
                'description' => 'Seminar mendalam mengupas fitur-fitur baru Next.js 15, React Server Components (RSC), caching strategis, dan optimasi performa web apps.',
            ],
            [
                'title' => 'UI/UX Design System Workshop',
                'category' => 'Teknologi',
                'description' => 'Cara merancang dan memelihara Design System yang konsisten di Figma untuk mempermudah kolaborasi desainer dan pengembang web/mobile.',
            ],
            [
                'title' => 'Mobile App Development with Flutter',
                'category' => 'Teknologi',
                'description' => 'Workshop membangun aplikasi mobile Android & iOS yang responsif dan berkinerja tinggi hanya menggunakan satu codebase dengan Flutter.',
            ],
            [
                'title' => 'React Native for Cross-Platform Apps',
                'category' => 'Teknologi',
                'description' => 'Pelatihan integrasi Native Module, pengelolaan state global, dan optimasi rendering pada aplikasi mobile menggunakan React Native.',
            ],
            [
                'title' => 'Rust Programming Language Introduction',
                'category' => 'Teknologi',
                'description' => 'Belajar bahasa pemrograman Rust yang aman, cepat, dan efisien untuk kebutuhan sistem bare-metal, WebAssembly, dan backend servis.',
            ],
            [
                'title' => 'DevOps CI/CD Pipelines with GitHub Actions',
                'category' => 'Teknologi',
                'description' => 'Membangun pipeline integrasi dan pengiriman otomatis (CI/CD) menggunakan GitHub Actions, AWS S3, dan monitoring tools.',
            ],
            [
                'title' => 'Linux System Administration Workshop',
                'category' => 'Teknologi',
                'description' => 'Workshop dasar mengelola server Linux, administrasi user, konfigurasi jaringan, manajemen firewall, dan shell scripting otomatisasi.',
            ],
            [
                'title' => 'Cloud Native Computing Meetup',
                'category' => 'Teknologi',
                'description' => 'Diskusi santai tentang tren cloud-native, teknologi serverless, API gateway, service mesh, dan optimasi biaya infrastruktur cloud.',
            ],
            [
                'title' => 'Database Optimization (PostgreSQL & MySQL)',
                'category' => 'Teknologi',
                'description' => 'Strategi optimasi query SQL, perancangan indeks yang tepat, teknik sharding, partisi data, serta manajemen replica database.',
            ],
            [
                'title' => 'API Development Best Practices with OpenAPI',
                'category' => 'Teknologi',
                'description' => 'Bagaimana merancang RESTful API yang konsisten, aman, dan terdokumentasi dengan baik menggunakan standar OpenAPI (Swagger).',
            ],
            [
                'title' => 'WordPress Developer Meetup Solo',
                'category' => 'Teknologi',
                'description' => 'Membahas pembuatan custom block editor Gutenberg, pembuatan plugin WordPress kustom, dan optimasi kecepatan website e-commerce.',
            ],
            [
                'title' => 'iOS Development with Swift & SwiftUI',
                'category' => 'Teknologi',
                'description' => 'Langkah pertama belajar pemrograman iOS menggunakan bahasa Swift modern dan pembuatan tata letak UI deklaratif dengan SwiftUI.',
            ],
            [
                'title' => 'Android Native Development with Kotlin',
                'category' => 'Teknologi',
                'description' => 'Membangun aplikasi Android modern menggunakan Kotlin, Jetpack Compose, Coroutines, dan clean architecture pattern.',
            ],

            // Category: Keuangan (21)
            [
                'title' => 'Indonesia Financial Summit 2026',
                'category' => 'Keuangan',
                'description' => 'Forum diskusi ekonomi makro dan mikro, peluang investasi domestik, serta tren teknologi keuangan (fintech) dalam perkembangan pasar global.',
            ],
            [
                'title' => 'Cerdas Berinvestasi Saham untuk Pemula',
                'category' => 'Keuangan',
                'description' => 'Panduan praktis membuka rekening sekuritas, membaca grafik saham dasar, menganalisis profil risiko, dan mengelola portofolio investasi.',
            ],
            [
                'title' => 'Perencanaan Keuangan Pribadi & Bebas Utang',
                'category' => 'Keuangan',
                'description' => 'Workshop menyusun anggaran bulanan, membedakan keinginan vs kebutuhan, manajemen utang produktif, serta cara menyiapkan dana darurat.',
            ],
            [
                'title' => 'Strategi Pajak UMKM & Freelancer',
                'category' => 'Keuangan',
                'description' => 'Pelatihan perhitungan pajak penghasilan mandiri, pengisian SPT tahunan elektronik, dan pemanfaatan fasilitas insentif pajak dari pemerintah.',
            ],
            [
                'title' => 'Reksadana & Obligasi Negara Workshop',
                'category' => 'Keuangan',
                'description' => 'Belajar instrumen investasi pendapatan tetap yang aman, menguntungkan, dan dijamin negara seperti Obligasi Ritel Indonesia (ORI) dan SR.',
            ],
            [
                'title' => 'Cryptocurrency & Blockchain Basics',
                'category' => 'Keuangan',
                'description' => 'Mengenal konsep dasar teknologi blockchain, mekanisme konsensus, cara kerja smart contracts, serta manajemen risiko investasi kripto.',
            ],
            [
                'title' => 'Forex Trading & Risk Management Seminar',
                'category' => 'Keuangan',
                'description' => 'Strategi trading valuta asing secara teknikal, manajemen margin, penggunaan indikator tren, dan kontrol psikologi saat menghadapi volatilitas.',
            ],
            [
                'title' => 'Financial Freedom in Twenties Workshop',
                'category' => 'Keuangan',
                'description' => 'Langkah-langkah strategis bagi anak muda untuk mencapai kebebasan finansial melalui investasi awal, diversifikasi aset, dan side income.',
            ],
            [
                'title' => 'Manajemen Keuangan Keluarga Era Digital',
                'category' => 'Keuangan',
                'description' => 'Tips membagi anggaran belanja rumah tangga, menabung untuk biaya pendidikan anak, asuransi kesehatan, serta dana pensiun bersama pasangan.',
            ],
            [
                'title' => 'Pensiun Dini & FIRE Movement Seminar',
                'category' => 'Keuangan',
                'description' => 'Memahami pergerakan Financial Independence, Retire Early (FIRE) dan perhitungan jumlah aset produktif yang dibutuhkan untuk pensiun dini.',
            ],
            [
                'title' => 'Peer-to-Peer Lending & Crowdfunding',
                'category' => 'Keuangan',
                'description' => 'Analisis instrumen investasi peer-to-peer lending, memahami tingkat pengembalian bunga, penilaian risiko gagal bayar, dan diversifikasi.',
            ],
            [
                'title' => 'Analisis Teknikal & Fundamental Saham',
                'category' => 'Keuangan',
                'description' => 'Metode mendalam menganalisis laporan keuangan perusahaan, rasio penting (PER, PBV, ROE), serta penggunaan pola candlestick untuk trading.',
            ],
            [
                'title' => 'Investasi Properti & Land Banking',
                'category' => 'Keuangan',
                'description' => 'Panduan membeli properti pertamamu, menilai potensi capital gain, strategi sewa-menyewa, serta aspek legalitas sertifikat tanah.',
            ],
            [
                'title' => 'Asuransi & Proteksi Kekayaan Keluarga',
                'category' => 'Keuangan',
                'description' => 'Memahami jenis asuransi jiwa murni, asuransi kesehatan, penyakit kritis, dan cara memilih proteksi yang tepat sesuai budget keluarga.',
            ],
            [
                'title' => 'Fintech Lending & Digital Banking Seminar',
                'category' => 'Keuangan',
                'description' => 'Eksplorasi ekosistem bank digital, kemudahan akses modal usaha bagi pelaku UMKM melalui platform finansial berbasis teknologi modern.',
            ],
            [
                'title' => 'Valuasi Bisnis & Pendanaan Start-up',
                'category' => 'Keuangan',
                'description' => 'Workshop bagi pendiri startup tentang cara menghitung nilai perusahaan (valuasi) dan teknik pitching untuk mendapatkan investasi dari modal ventura.',
            ],
            [
                'title' => 'Pengelolaan Keuangan Bisnis Ritel',
                'category' => 'Keuangan',
                'description' => 'Cara mengontrol arus kas (cashflow) harian, mengelola persediaan barang, menentukan margin keuntungan, dan memperkirakan titik impas.',
            ],
            [
                'title' => 'Emas Logam Mulia vs Emas Digital',
                'category' => 'Keuangan',
                'description' => 'Perbandingan keuntungan investasi emas fisik batangan dan platform emas digital, tren harga emas global, serta likuidasi jangka panjang.',
            ],
            [
                'title' => 'Pengenalan Pasar Modal Syariah',
                'category' => 'Keuangan',
                'description' => 'Mempelajari hukum transaksi saham syariah, daftar efek syariah (DES), obligasi syariah (sukuk), serta reksa dana yang sesuai fatwa DSN-MUI.',
            ],
            [
                'title' => 'Literasi Keuangan Anak & Remaja',
                'category' => 'Keuangan',
                'description' => 'Seminar bagi orang tua tentang cara memperkenalkan konsep uang, menabung, berbagi, dan berbelanja bijak pada anak sejak usia dini.',
            ],
            [
                'title' => 'Wealth Management Masterclass',
                'category' => 'Keuangan',
                'description' => 'Strategi tingkat lanjut bagi investor profesional untuk mempertahankan nilai kekayaan, suksesi keluarga, serta alokasi aset global.',
            ],

            // Category: Artificial Intelligence (21)
            [
                'title' => 'AI & ChatGPT for Business Productivity',
                'category' => 'Artificial Intelligence',
                'description' => 'Mempelajari pemanfaatan AI generatif untuk merancang materi pemasaran, membuat naskah, otomatisasi laporan, serta meningkatkan efisiensi kerja.',
            ],
            [
                'title' => 'Midjourney & Stable Diffusion Art Workshop',
                'category' => 'Artificial Intelligence',
                'description' => 'Pelatihan merancang prompt seni digital yang memukau, teknik inpainting/outpainting, dan proses pembuatan aset visual komersial dengan AI.',
            ],
            [
                'title' => 'Python for Machine Learning Bootcamp',
                'category' => 'Artificial Intelligence',
                'description' => 'Bootcamp dasar pemrograman Python, manipulasi data dengan Pandas/NumPy, serta pembuatan model klasifikasi dasar menggunakan Scikit-Learn.',
            ],
            [
                'title' => 'Deep Learning & Computer Vision Hands-on',
                'category' => 'Artificial Intelligence',
                'description' => 'Workshop membangun model pendeteksi objek secara real-time, segmentasi citra, dan klasifikasi gambar menggunakan TensorFlow dan OpenCV.',
            ],
            [
                'title' => 'Natural Language Processing (NLP) Indonesia',
                'category' => 'Artificial Intelligence',
                'description' => 'Pelajari analisis sentimen media sosial dalam Bahasa Indonesia, pembuatan chatbot, serta pemanfaatan pre-trained model BERT.',
            ],
            [
                'title' => 'AI-Powered Automation with Make & Zapier',
                'category' => 'Artificial Intelligence',
                'description' => 'Otomatisasi alur kerja digital tanpa coding dengan mengintegrasikan email, spreadsheet, AI API, dan media sosial secara otomatis.',
            ],
            [
                'title' => 'Generative AI for Content Creators',
                'category' => 'Artificial Intelligence',
                'description' => 'Bagaimana para pembuat konten memanfaatkan AI untuk riset kata kunci, penulisan skrip video, penyuntingan klip audio, dan pembuatan thumbnail.',
            ],
            [
                'title' => 'Prompt Engineering Masterclass',
                'category' => 'Artificial Intelligence',
                'description' => 'Seni merancang instruksi yang efektif untuk Large Language Models (LLM) guna mendapatkan jawaban yang akurat, terstruktur, dan berguna.',
            ],
            [
                'title' => 'TensorFlow & PyTorch Crash Course',
                'category' => 'Artificial Intelligence',
                'description' => 'Membandingkan dua framework machine learning terpopuler, cara melatih neural network, serta menyimpan dan merilis model AI ke production.',
            ],
            [
                'title' => 'AI Ethics & Regulation Seminar',
                'category' => 'Artificial Intelligence',
                'description' => 'Diskusi kritis mengenai bias algoritma, hak cipta karya buatan AI, perlindungan data pribadi, dan masa depan pasar tenaga kerja.',
            ],
            [
                'title' => 'Large Language Models (LLM) Integration',
                'category' => 'Artificial Intelligence',
                'description' => 'Integrasi API OpenAI, Anthropic, atau open-source LLM ke dalam aplikasi web internal untuk meningkatkan fitur penelusuran dokumen.',
            ],
            [
                'title' => 'Predictive Analytics for Sales & Marketing',
                'category' => 'Artificial Intelligence',
                'description' => 'Menggunakan data historis penjualan untuk meramalkan tren pasar di masa depan, analisis churn pelanggan, dan penargetan iklan presisi.',
            ],
            [
                'title' => 'AI in Healthcare & Medical Diagnosis',
                'category' => 'Artificial Intelligence',
                'description' => 'Peran kecerdasan buatan dalam memindai hasil rontgen, akselerasi riset obat-obatan, serta pendukung diagnosis dokter secara akurat.',
            ],
            [
                'title' => 'Reinforcement Learning & Robotics Seminar',
                'category' => 'Artificial Intelligence',
                'description' => 'Membahas konsep agen cerdas yang belajar secara trial-and-error untuk navigasi robotik, game AI, dan optimasi logistik.',
            ],
            [
                'title' => 'Data Science & Big Data Conference',
                'category' => 'Artificial Intelligence',
                'description' => 'Mengolah miliaran data terstruktur dan tidak terstruktur menggunakan kluster Spark dan Hadoop untuk dianalisis oleh tim data scientist.',
            ],
            [
                'title' => 'Building AI Agents with LangChain',
                'category' => 'Artificial Intelligence',
                'description' => 'Membangun aplikasi cerdas yang memiliki ingatan, memanggil API eksternal, dan mengambil keputusan dinamis menggunakan library LangChain.',
            ],
            [
                'title' => 'Vector Databases & RAG Architecture',
                'category' => 'Artificial Intelligence',
                'description' => 'Implementasi Retrieval-Augmented Generation (RAG) menggunakan Vector Database (Pinecone, ChromaDB) untuk chatbot berbasis dokumen perusahaan.',
            ],
            [
                'title' => 'AI for Software Engineering (GitHub Copilot)',
                'category' => 'Artificial Intelligence',
                'description' => 'Memaksimalkan alat bantu coding berbasis AI untuk menulis pengujian unit otomatis, dokumentasi kode, serta refactoring yang cepat.',
            ],
            [
                'title' => 'Speech Recognition & Synthesis Workshop',
                'category' => 'Artificial Intelligence',
                'description' => 'Membangun asisten suara pintar dengan model text-to-speech (TTS) dan speech-to-text (STT) berkualitas tinggi dalam berbagai aksen lokal.',
            ],
            [
                'title' => 'Recommendation Systems in E-Commerce',
                'category' => 'Artificial Intelligence',
                'description' => 'Algoritma penyaringan kolaboratif dan berbasis konten untuk merekomendasikan produk yang relevan kepada pengguna guna meningkatkan konversi.',
            ],
            [
                'title' => 'AI-Driven Financial Forecasting',
                'category' => 'Artificial Intelligence',
                'description' => 'Menggunakan model jaringan saraf berulang (RNN/LSTM) untuk mendeteksi anomali transaksi keuangan ilegal dan prediksi pergerakan harga komoditas.',
            ],

            // Category: Makanan (21)
            [
                'title' => 'Workshop Kopi: Dari Biji Hingga Espresso',
                'category' => 'Makanan',
                'description' => 'Belajar anatomi biji kopi, proses roasting dasar, teknik manual brewing (V60, Aeropress), serta cara mengoperasikan mesin espresso komersial.',
            ],
            [
                'title' => 'Culinary Masterclass: Rahasia Sambal Nusantara',
                'category' => 'Makanan',
                'description' => 'Kelas memasak interaktif mengulik teknik membuat 10 jenis sambal legendaris Indonesia dengan rasa autentik dan daya simpan alami.',
            ],
            [
                'title' => 'Pelatihan Pembuatan Roti Sourdough Rumahan',
                'category' => 'Makanan',
                'description' => 'Mempelajari cara memelihara starter ragi alami (wild yeast), menguleni adonan hidrasi tinggi, teknik proofing, dan pembakaran roti berkerak renyah.',
            ],
            [
                'title' => 'Kreasi Dessert Box Kekinian Workshop',
                'category' => 'Makanan',
                'description' => 'Workshop praktis merangkai kue dalam wadah mika dengan berbagai layer krim cokelat, keju, biskuit renyah, dan saus karamel lezat.',
            ],
            [
                'title' => 'Sushi & Sashimi Making Masterclass',
                'category' => 'Makanan',
                'description' => 'Teknik memilih ikan mentah segar standar restoran, cara membumbui nasi sushi (shari), serta melatih teknik menggulung maki dan nigiri.',
            ],
            [
                'title' => 'Healthy Meal Prep & Nutrition Seminar',
                'category' => 'Makanan',
                'description' => 'Menghitung kebutuhan kalori harian, merancang menu sehat seminggu penuh, serta trik membekukan makanan agar nutrisinya tetap terjaga.',
            ],
            [
                'title' => 'Festival Jajanan Pasar Legendaris',
                'category' => 'Makanan',
                'description' => 'Bazaar kuliner yang menyajikan ratusan jenis kue tradisional nusantara seperti lupis, klepon, getuk, dan lemper dari pembuat legendaris.',
            ],
            [
                'title' => 'Cake Decorating & Fondant Art Course',
                'category' => 'Makanan',
                'description' => 'Pelatihan menghias kue ulang tahun bertingkat menggunakan buttercream halus, royal icing, serta teknik memahat boneka dari bahan fondant.',
            ],
            [
                'title' => 'Food Photography & Styling Meetup',
                'category' => 'Makanan',
                'description' => 'Tips menata makanan agar terlihat menggugah selera di depan kamera, memanfaatkan pencahayaan alami, dan teknik editing foto ponsel.',
            ],
            [
                'title' => 'Barista & Latte Art Hands-on Training',
                'category' => 'Makanan',
                'description' => 'Pelatihan praktis foaming susu bertekstur mikro (microfoam) dan melukis pola dasar latte art seperti heart, tulip, dan rosetta.',
            ],
            [
                'title' => 'Cooking Demo: Pasta & Italian Cuisine',
                'category' => 'Makanan',
                'description' => 'Demo membuat pasta segar dari tepung semolina, saus bolognese klasik yang dimasak perlahan, dan saus carbonara telur autentik.',
            ],
            [
                'title' => 'Pembuatan Kombucha & Fermentasi Sehat',
                'category' => 'Makanan',
                'description' => 'Mempelajari budidaya jamur SCOBY, fermentasi teh manis menjadi kombucha kaya probiotik, serta pembuatan kefir susu dan water kefir.',
            ],
            [
                'title' => 'Pelatihan Masakan Padang Autentik',
                'category' => 'Makanan',
                'description' => 'Rahasia bumbu rempah melimpah untuk memasak Rendang Daging sapi empuk, Gulai Tunjang, dan Sambal Ijo khas Minang.',
            ],
            [
                'title' => 'Diet Keto & Intermittent Fasting Seminar',
                'category' => 'Makanan',
                'description' => 'Memahami metabolisme tubuh saat fase ketosis, panduan makan rendah karbohidrat tinggi lemak, dan jendela waktu puasa yang aman.',
            ],
            [
                'title' => 'Vegan & Plant-Based Culinary Class',
                'category' => 'Makanan',
                'description' => 'Membuat masakan lezat tanpa produk hewani, memanfaatkan protein nabati seperti tempe, tahu, seitan, dan susu almond untuk aneka olahan.',
            ],
            [
                'title' => 'Pastry & Croissant Baking Workshop',
                'category' => 'Makanan',
                'description' => 'Teknik melaminasi mentega ke dalam adonan tepung (lamination) untuk menghasilkan lapisan berongga (airy layers) khas croissant Prancis.',
            ],
            [
                'title' => 'Dim Sum & Dumpling Cooking Class',
                'category' => 'Makanan',
                'description' => 'Belajar membuat kulit pangsit tipis kenyal, isian udang ayam gurih berair, serta teknik melipat siomay, hakau, dan gyoza.',
            ],
            [
                'title' => 'Bisnis Franchise Kuliner Pemula',
                'category' => 'Makanan',
                'description' => 'Seminar menganalisis prospek kemitraan waralaba makanan/minuman kekinian, SOP operasional toko, dan perhitungan proyeksi balik modal.',
            ],
            [
                'title' => 'Pembuatan Ice Cream & Gelato Rumahan',
                'category' => 'Makanan',
                'description' => 'Membuat es krim krimi bertekstur lembut dan gelato Italia rendah lemak menggunakan buah-buahan segar tanpa bahan pengawet.',
            ],
            [
                'title' => 'Street Food & Culinary Tourism Festival',
                'category' => 'Makanan',
                'description' => 'Merayakan keberagaman jajanan kaki lima khas berbagai daerah Indonesia mulai dari kerak telor, batagor, martabak, hingga tahu gejrot.',
            ],
            [
                'title' => 'Traditional Indonesian Beverage Making',
                'category' => 'Makanan',
                'description' => 'Belajar meracik minuman tradisional berkhasiat seperti jamu kunyit asam, beras kencur, bir pletok, dan wedang ronde hangat.',
            ],

            // Category: Kerajinan Tangan (21)
            [
                'title' => 'Pelatihan Keramik Tanah Liat: Gelas Unik',
                'category' => 'Kerajinan Tangan',
                'description' => 'Membentuk tanah liat menggunakan meja putar elektrik (throwing) dan teknik cubit (pinching) hingga menjadi cangkir minum yang artistik.',
            ],
            [
                'title' => 'Workshop Rajut Dasar: Membuat Syal',
                'category' => 'Kerajinan Tangan',
                'description' => 'Belajar teknik merajut menggunakan dua jarum (knitting) untuk pemula, mulai dari membuat simpul awal hingga membentuk syal hangat.',
            ],
            [
                'title' => 'Kreasi Amigurumi: Boneka Rajut Mini',
                'category' => 'Kerajinan Tangan',
                'description' => 'Teknik merajut satu jarum (crochet) berbentuk spiral untuk membuat boneka karakter hewan lucu, gantungan kunci, dan boneka mini.',
            ],
            [
                'title' => 'Workshop Macrame: Seni Simpul Kreatif',
                'category' => 'Kerajinan Tangan',
                'description' => 'Belajar variasi simpul tali katun untuk membuat hiasan dinding estetik bohemia (wall hanging), gantungan pot tanaman, dan tas belanja.',
            ],
            [
                'title' => 'Seni Melipat Kertas (Origami) untuk Edukasi',
                'category' => 'Kerajinan Tangan',
                'description' => 'Pelatihan melipat kertas membentuk aneka hewan, bunga, dan bentuk geometris tiga dimensi untuk melatih motorik anak.',
            ],
            [
                'title' => 'Melukis dengan Cat Air (Watercolor Landscape)',
                'category' => 'Kerajinan Tangan',
                'description' => 'Teknik menyapu warna transparan (wash technique), blending gradasi langit senja, serta melukis pohon dan pegunungan dengan cat air.',
            ],
            [
                'title' => 'Pembuatan Lilin Aromaterapi Organik',
                'category' => 'Kerajinan Tangan',
                'description' => 'Membuat lilin wangi ramah lingkungan menggunakan lilin kedelai alami (soy wax), sumbu kayu, bunga kering, dan minyak atsiri pilihan.',
            ],
            [
                'title' => 'Pembuatan Sabun Alami Ramah Lingkungan',
                'category' => 'Kerajinan Tangan',
                'description' => 'Metode pembuatan sabun mandi menggunakan minyak zaitun, minyak kelapa, soda api (cold process), serta pewarna tanah alami.',
            ],
            [
                'title' => 'Resin Art & Coaster Making Workshop',
                'category' => 'Kerajinan Tangan',
                'description' => 'Mencampur cairan epoksi resin dengan pigmen warna, serpihan emas, dan bunga kering untuk membuat alas gelas (coaster) cantik berkilau.',
            ],
            [
                'title' => 'Woodworking Basics: Pembuatan Kotak Perhiasan',
                'category' => 'Kerajinan Tangan',
                'description' => 'Dasar mengukur, menggergaji kayu pinus, menghaluskan dengan amplas, serta teknik menyambung kayu tanpa paku untuk kotak kayu serbaguna.',
            ],
            [
                'title' => 'Paper Quilling: Seni Menggulung Kertas',
                'category' => 'Kerajinan Tangan',
                'description' => 'Menggulung potongan kertas warna-warni secara melingkar lalu membentuknya menjadi hiasan bunga timbul pada kartu ucapan.',
            ],
            [
                'title' => 'Teknik Membatik Tulis Tradisional',
                'category' => 'Kerajinan Tangan',
                'description' => 'Belajar memegang canting, menulis malam panas di atas kain katun, proses pewarnaan celup, dan melarutkan malam (lorot).',
            ],
            [
                'title' => 'Leather Crafting: Membuat Dompet Kulit',
                'category' => 'Kerajinan Tangan',
                'description' => 'Memotong bahan kulit sapi asli (vegetable tanned leather), melubangi jahitan dengan puncher, dan teknik jahit tangan silang.',
            ],
            [
                'title' => 'Embroidery & Seni Sulam Tangan',
                'category' => 'Kerajinan Tangan',
                'description' => 'Menghias kain dengan berbagai teknik tusukan sulam (satin stitch, French knot, lazy daisy) bermotif bunga di atas lingkaran pemidang.',
            ],
            [
                'title' => 'Calligraphy & Hand Lettering Workshop',
                'category' => 'Kerajinan Tangan',
                'description' => 'Belajar menulis huruf latin bersambung yang artistik menggunakan pena kuas (brush pen), memahami tekanan tebal-tipis goresan.',
            ],
            [
                'title' => 'Pressed Flower Art & Frame Decoration',
                'category' => 'Kerajinan Tangan',
                'description' => 'Mengeringkan kelopak bunga segar dengan teknik press, menatanya secara estetik di atas kertas bebas asam, dan membingkainya dalam kaca ganda.',
            ],
            [
                'title' => 'Terrarium & Miniature Garden Making',
                'category' => 'Kerajinan Tangan',
                'description' => 'Menyusun lapisan batu drainase, tanah humus, tanaman sukulen mini, dan lumut di dalam wadah kaca transparan menyerupai ekosistem hutan.',
            ],
            [
                'title' => 'Tie Dye & Shibori Fabric Workshop',
                'category' => 'Kerajinan Tangan',
                'description' => 'Eksperimen melipat, mengikat, dan menjepit kain menggunakan karet lalu mencelupkannya ke pewarna indigo khas teknik tradisional Jepang.',
            ],
            [
                'title' => 'Jewelry Making: Manik-manik & Kawat',
                'category' => 'Kerajinan Tangan',
                'description' => 'Merangkai batu alam, manik-manik mutiara air tawar, dan melilit kawat tembaga menjadi perhiasan kalung, gelang, dan anting unik.',
            ],
            [
                'title' => 'Upcycling Craft: Kerajinan Daur Ulang',
                'category' => 'Kerajinan Tangan',
                'description' => 'Mengubah botol kaca bekas, kardus, atau kaleng menjadi barang dekoratif bernilai seni tinggi seperti vas bunga, wadah alat tulis, dan lampu tidur.',
            ],
            [
                'title' => 'Painting on Canvas: Abstract Art Workshop',
                'category' => 'Kerajinan Tangan',
                'description' => 'Mengekspresikan diri melalui goresan kuas, pisau palet, dan teknik cipratan cat akrilik di atas kanvas ukuran 40x40 cm tanpa batasan teori.',
            ],
        ];

        // 6. Loop and Seed the Events
        // We will seed exactly 105 events.
        // We pick a venue sequentially (index modulo 120) to ensure a high variety of real Indonesian coordinates.
        foreach ($eventsData as $index => $eventTemplate) {
            $categoryName = $eventTemplate['category'];
            $category = $categories->get($categoryName);

            // Get a venue from the pool sequentially
            $venueIndex = $index % count($venues);
            $venue = $venues[$venueIndex];

            // Generate a realistic future start and end datetime
            // Spread across the next 12 months, start at a clean hour, last between 2 and 6 hours.
            $startDate = now()
                ->addDays($index + 2) // staggered dates
                ->setHour(rand(8, 16)) // morning or afternoon start
                ->setMinute(rand(0, 1) * 30) // clean half-hour blocks (0 or 30)
                ->setSecond(0);

            $endDate = (clone $startDate)->addHours(rand(2, 6));

            // Random but realistic prices (some free, some paid)
            $prices = [0, 0, 15000, 25000, 50000, 75000, 100000, 150000, 250000];
            $price = $prices[array_rand($prices)];

            // Random capacities
            $capacities = [30, 50, 100, 150, 200, 300, 500];
            $capacity = $capacities[array_rand($capacities)];

            Event::create([
                'user_id' => $allUsers->random()->id,
                'category_id' => $category->id,
                'type' => 'offline',
                'title' => $eventTemplate['title'],
                'description' => $eventTemplate['description'],
                'price' => $price,

                // Real coordinate & address mapping
                'location_name' => $venue['name'],
                'address' => $venue['address'],
                'latitude' => $venue['latitude'],
                'longitude' => $venue['longitude'],

                'platform_name' => null,
                'link' => null,

                'start_datetime' => $startDate,
                'end_datetime' => $endDate,
                'capacity' => $capacity,
                'view_count' => rand(5, 1200),
            ]);
        }
    }
}
