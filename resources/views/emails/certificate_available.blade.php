<x-mail::message>
# Halo {{ $user->name }},

Sertifikat untuk event **{{ $event->title }}** sudah tersedia!

Kamu bisa mengunduh sertifikatmu melalui aplikasi Lokacara.

<x-mail::button :url="url('/dashboard')">
Buka Dashboard
</x-mail::button>

Selamat,<br>
Tim Lokacara
</x-mail::message>
