# Ringkasan Perubahan: Mobile Certificate & Location Contracts

**Branch:** `feature/support-mobile-certificate-location-contracts`
**Tanggal:** 22 Juni 2026

---

## Daftar File

### File Baru (Tambahan)

| File | Deskripsi |
|---|---|
| `app/Services/ReverseGeocodeService.php` | Service reverse geocode koordinat → nama kota via Nominatim (OSM, gratis) |
| `app/Console/Commands/BackfillEventCitiesCommand.php` | Command `events:backfill-cities` untuk backfill city dari alamat event lama |
| `database/migrations/2026_06_22_155029_add_city_to_events_table.php` | Migration menambah kolom `city` (nullable, indexed) ke tabel events |
| `tests/Feature/CertificateStateTest.php` | 21 test untuk state sertifikat, streaming, upload, distribusi, cleanup |
| `tests/Feature/EventCityTest.php` | 12 test untuk validasi city, auto-detect, filter, backfill, pagination |

### File Diubah (Modifikasi)

| File | Deskripsi |
|---|---|
| `.gitignore` | Tambah `/.opencode` dan `/.codex` |
| `routes/api.php` | Tambah 2 route: `GET .../certificates` (state) dan `GET .../certificates/template/stream` |
| `app/Http/Controllers/Api/CertificateApiController.php` | State endpoint, template stream, upload persistent, distribute layout persistence |
| `app/Http/Controllers/Api/DiscoveryController.php` | Tambah filter `location` (exact city, case-insensitive) |
| `app/Http/Controllers/Api/EventManagementApiController.php` | City auto-detect dari koordinat, validasi city jadi nullable |
| `app/Http/Controllers/Web/EventManagementController.php` | Sama — auto-detect city, validasi nullable, cleanup template saat delete |
| `app/Jobs/DistributeCertificatesJob.php` | Hapus `Storage::delete()` template setelah distribusi (template persisten) |
| `app/Models/Event.php` | Tambah `city` ke fillable array |
| `app/OpenApi/Schemas/EventSchema.php` | Tambah property `city` di OpenAPI schema |

### File Terformat (Pint)

File berikut hanya terformat ulang oleh pint (whitespace, import ordering) — tidak ada perubahan logika:

- `app/Http/Controllers/AdminModerationController.php`
- `app/Http/Controllers/Auth/GoogleController.php`
- `app/Http/Controllers/Auth/LoginController.php`
- `app/Http/Controllers/Web/DiscoveryController.php`
- `app/Providers/FortifyServiceProvider.php`
- `tests/Feature/AdminDashboardFeaturesTest.php`
- `tests/Feature/Auth/GoogleOAuthTest.php`
- `tests/Feature/ModerationTest.php`

---

## Perubahan Per Fitur

### 1. Persistent Organizer Certificate State

**Tujuan:** Template dan layout sertifikat organizer disimpan persisten, bukan temporary. Organizer bisa melihat state dan preview template kapan saja.

#### Route Baru

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/api/organizer/events/{event}/certificates` | Owner only | Mengembalikan state konfigurasi sertifikat |
| `GET` | `/api/organizer/events/{event}/certificates/template/stream` | Owner only | Stream file gambar template |

#### State Response (`GET .../certificates`)

```json
{
  "event": {...},
  "is_eligible": true,
  "has_template": true,
  "issued_count": 5,
  "last_issued_at": "2026-07-16T10:00:00Z",
  "status": "ready",
  "layout": {
    "font_family": "Roboto",
    "font_color": "#000000",
    "font_size": "Medium",
    "x_pos": 50,
    "is_x_center": true,
    "y_pos": 50,
    "is_y_center": true,
    "max_width": 80,
    "max_height": 20
  }
}
```

**Status values:**
- `not_configured` — template file tidak ada **atau** font family belum diset (salah satu saja sudah triggers)
- `ready` — template dan layout sudah dikonfigurasi, belum ada sertifikat terbit
- `distributed` — minimal 1 sertifikat sudah diterbitkan

**Eligibility:** Event sudah selesai (`end_datetime < now`) DAN minimal ada 1 peserta dengan status `present`.

#### Perubahan Upload (`POST .../template`)

| Sebelum | Sesudah |
|---|---|
| Upload ke `temp/xxx.jpg` (temporary) | Upload ke `event-templates/{event_id}/xxx.jpg` (persistent, milik event) |
| Tidak update model | Update `certificate_template` di event |
| Tidak hapus file lama | Hapus file lama setelah file baru sukses tersimpan (atomic) |

#### Perubahan Distribusi (`POST .../distribute`)

| Sebelum | Sesudah |
|---|---|
| Terima `template_path` apa saja yang ada di disk | Terima hanya path yang cocok dengan `event.certificate_template` atau legacy path yang valid |
| Path unrelated → crash/404 biasa | Path unrelated → 404 dengan pesan jelas |
| Layout fields tidak disimpan ke event | Layout fields (`font_family`, `font_color`, dsb) disimpan ke event model sebelum dispatch |
| Job hapus template setelah selesai | Job **tidak** menghapus template (persisten) |

#### Perubahan Job (`DistributeCertificatesJob`)

- **Dihapus:** `Storage::disk('local')->delete($this->templatePath)` pada 3 tempat:
  - Saat registrations kosong
  - Saat attendee name blank
  - Setelah semua sertifikat selesai dibuat

#### Event Deletion Cleanup

Saat event dihapus (API `destroy` dan Web `destroy`):
- Menghapus file template spesifik (`certificate_template`) milik event
- File lain dalam folder yang sama tetap utuh (sibling file tidak terpengaruh)

---

### 2. Canonical Event City

**Tujuan:** Event menyimpan canonical city untuk pencarian yang akurat lintas pagination.

#### Migration

```sql
ALTER TABLE events ADD COLUMN city VARCHAR NULL;
CREATE INDEX events_city_index ON events (city);
```

#### Auto-Detect City dari Koordinat

`ReverseGeocodeService` bekerja sebagai berikut:

1. Terima `latitude` dan `longitude` dari event offline
2. Panggil Nominatim OSM: `nominatim.openstreetmap.org/reverse?format=json&lat=...&lon=...&zoom=10`
3. Ekstrak nama kota dari `address.city` / `address.town` / `address.municipality`
4. Cocokkan ke `locations` table (11 canonical cities: Jakarta, Surabaya, Bandung, Medan, Semarang, Makassar, Denpasar, Surakarta, Yogyakarta, Balikpapan, Samarinda)
5. Timeout 5 detik — jika gagal, city tetap null (tidak error)
6. Client bisa override manual via field `city` (opsional)

**Trigger:** Dipanggil otomatis saat create/update event offline jika field `city` tidak diisi manual.

#### Validasi

| Type | Sebelum | Sesudah |
|---|---|---|
| Offline | `city` WAJIB (`required_if:type,offline`) | `city` OPSIONAL (`nullable`) — auto-detect dari koordinat |
| Online | `city` tidak divalidasi | `city` otomatis di-null-kan |

#### Discovery Filter

`GET /api/events/search?location=Surakarta`

- Exact match, case-insensitive: `LOWER(city) = LOWER('surakarta')`
- Tidak search venue name atau address
- Diaplikasikan **sebelum** pagination — konsisten di semua halaman
- Event dengan city null tidak muncul di hasil filtered

#### Backfill Command

```bash
php artisan events:backfill-cities
```

- Hanya proses event dengan `city IS NULL` DAN `type = 'offline'` DAN `address IS NOT NULL`
- Parse pola `Kota <nama>` dan `Kabupaten <nama>` dari address
- Skip jika nama terlalu pendek (< 3 karakter), terlalu panjang (> 50), atau diawali angka
- Idempotent — aman dijalankan berulang kali
- Report unresolved events di terminal output

---

### 3. File Gitignore

- `/.opencode` — konfigurasi opencode tools
- `/.codex` — konfigurasi codex tools

---

## Test Coverage

### Total: 133 tests pass, 1 skipped (two-factor)
- 21 test CertificateStateTest
- 12 test EventCityTest
- 21 test CertificateManagementTest (existing)
- 8 test EventDiscoveryTest (existing)
- 71 test lainnya (auth, dashboard, moderation, etc.)

### Test Baru

| File | Tests | Coverage |
|---|---|---|
| `CertificateStateTest.php` | 21 | Ownership, state shape, not_configured with layout-only, streaming, replacement rollback, legacy compatibility, unrelated/rejected paths, cross-event rejection, post-job persistence, delete cleanup (single file, sibling survives) |
| `EventCityTest.php` | 12 | Auto-detect from coordinates, manual input normalization, online clearing, type switch clearing, exact location filter, case-insensitive, venue false positives, null legacy exclusion, multi-page pagination, backfill command, event create without manual city |

### Test Yang Diperbarui

| Test | Perubahan |
|---|---|
| `offline event store` | Dari "city required" ke "city auto-detected from coordinates" |
| `offline event update` | Dari "city accepted" ke "city auto-detected from coordinates" |
| `city validation required` | Dihapus (diganti test "creates successfully without manual city") |

---

## Dampak ke Client (Android)

| Aspek | Dampak |
|---|---|
| Upload template | Path response berubah dari `temp/...` ke `event-templates/{id}/...` — format tidak perlu di-parse oleh client |
| Distribusi sertifikat | Backward compatible — path lama masih diterima |
| State sertifikat | Endpoint BARU — client bisa ganti fallback lokal dengan data server |
| Template stream | Endpoint BARU — client bisa preview template terotorisasi |
| City | **Zero breaking change** — auto-detect dari koordinat, client tidak perlu kirim field `city` |
| Discovery search | Parameter BARU `location` — client bisa filter kota exact, tidak perlu client-side filter |

---

## Deployment Order

1. `php artisan migrate` — tambah kolom `city` (nullable, no downtime)
2. Deploy kode backend
3. `php artisan events:backfill-cities` — isi city dari address event lama
4. Rilis Android (opsional — bisa setelah backend)
5. Setelah Android teradopsi, baru wajibkan `city` di level validasi

## Rollback

- Kolom `city` nullable — menghapus kode tetap aman
- Template di `event-templates/{id}/` hanya dihapus file spesifik saat event dihapus, file lain tidak terpengaruh
- Tidak ada perubahan skema yang breaking
