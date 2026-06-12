<x-mail::message>
# Halo {{ $user->name }},

Terima kasih telah bergabung dengan **Lokacara**. Silakan gunakan kode OTP berikut untuk memverifikasi alamat email Anda:

<x-mail::panel>
# {{ $otp }}
</x-mail::panel>

Kode OTP ini berlaku selama 15 menit. Jangan membagikan kode ini kepada siapa pun demi keamanan akun Anda.

Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini.

Salam hangat,<br>
Tim Lokacara
</x-mail::message>
