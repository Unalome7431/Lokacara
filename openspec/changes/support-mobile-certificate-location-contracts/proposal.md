## Why

Aplikasi mobile tidak dapat memulihkan konfigurasi sertifikat organizer karena template API saat ini bersifat sementara dan dihapus setelah distribusi. Pencarian event juga tidak memiliki filter kota server-side, sehingga mobile hanya dapat memfilter satu halaman berdasarkan teks venue dan menghasilkan lokasi yang tidak akurat.

## What Changes

- Menyediakan state pengelolaan sertifikat organizer yang memuat eligibility event, template dan layout tersimpan, serta ringkasan sertifikat yang telah diterbitkan.
- Menambahkan stream template terautentikasi untuk preview organizer tanpa mengekspos file storage secara publik.
- Mengubah upload/distribute API agar template dan layout menjadi state event yang persisten dan tetap mendukung request mobile lama.
- Menambahkan canonical city pada event dan menerima nilainya pada create/update event offline.
- Menambahkan filter kota exact pada pencarian event dan memastikan filter tetap berlaku di seluruh pagination.
- Melakukan backfill conservative terhadap event lama dari komponen administratif alamat; data yang tidak dapat dipastikan tetap bernilai null.

## Capabilities

### New Capabilities

- `mobile-organizer-certificate-state`: API menyediakan konfigurasi, template, eligibility, dan ringkasan distribusi sertifikat organizer yang persisten dan terotorisasi.
- `canonical-city-event-search`: Event menyimpan canonical city dan discovery API memfilter kota secara exact, bukan melalui substring venue atau alamat.

### Modified Capabilities

None.

## Impact

- Laravel API routes, `CertificateApiController`, `DiscoveryController`, dan `EventManagementApiController`.
- Model/migration event, certificate distribution job, validation, serialization, dan OpenAPI schema.
- Storage template sertifikat berubah dari file temporary menjadi file milik event yang persisten.
- Android dapat mengganti fallback lokal dengan state server dan memperoleh hasil lokasi lengkap lintas pagination.
- Diperlukan feature tests untuk ownership, file streaming, compatibility, city validation, backfill, dan paginated filtering.
