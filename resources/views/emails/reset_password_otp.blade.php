<x-mail::message>
# Halo {{ $user->name }},

Kami menerima permintaan untuk mengatur ulang kata sandi akun **Lokacara** Anda. Silakan gunakan kode OTP berikut untuk melanjutkan proses pengaturan ulang kata sandi:

<x-mail::panel>
# {{ $otp }}
</x-mail::panel>

Kode OTP ini berlaku selama 15 menit. Demi keamanan akun Anda, jangan pernah membagikan kode ini kepada siapa pun.

Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini dan kata sandi Anda akan tetap aman.

Salam hangat,<br>
Tim Lokacara
</x-mail::message>
