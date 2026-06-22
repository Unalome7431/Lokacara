# Backend Sync Summary

**Repo:** `D:\Lokacara\Lokacara`
**Date:** 2026-06-22

## Purpose

Dokumen ini merangkum perubahan backend yang disesuaikan agar kontrak API tetap menjadi sumber kebenaran, sementara client Android mengikuti backend.

## Changed Areas

### 1. Certificate State Contract

- Mengubah respons state sertifikat organizer menjadi payload flat:
  - `is_eligible`
  - `has_template`
  - `issued_count`
  - `last_issued_at`
  - `status`
  - `layout`
- Android disesuaikan untuk membaca payload ini.
- Eligibility dihitung dari `end_datetime`, bukan `start_datetime`.
- Status `not_configured` hanya muncul jika template belum ada atau layout belum terset.

### 2. Certificate Template Ownership

- Template upload/distribute tetap memakai path milik event:
  - `event-templates/{event_id}/...`
- Distribusi hanya menerima template milik event yang sama.
- Cleanup delete event hanya menghapus file template spesifik, bukan seluruh parent directory.

### 3. Event City Contract

- Menambahkan kolom `city` pada event.
- `city` pada event offline bisa diisi manual atau di-auto-detect oleh backend.
- `city` pada event online selalu di-null-kan.
- Search event memakai filter exact city, case-insensitive.

### 4. Auto-Detect City

- Backend melakukan reverse geocode dari koordinat offline event.
- Hasilnya dipetakan ke daftar location canonical dengan exact match lalu fallback ke partial match.
- Jika tidak ada match canonical, backend menyimpan hasil kota yang dinormalisasi dari reverse geocode.

### 5. Backfill Utility

- Menambahkan command:

```bash
php artisan events:backfill-cities
```

- Command ini mengisi `city` untuk event offline lama berdasarkan address yang bisa diparse.

## Verification

- `php artisan test --filter CertificateStateTest`
- `php artisan test --filter EventCityTest`

## Notes for Client

- Android harus mengikuti kontrak backend, bukan sebaliknya.
- Field `city` pada Android sekarang bersifat sinkronisasi data, bukan sumber kebenaran.
- Path template yang valid berasal dari backend dan tidak perlu diparse ulang di client.
