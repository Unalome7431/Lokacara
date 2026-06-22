<?php

namespace App\Services;

use App\Models\Location;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReverseGeocodeService
{
    /**
     * Returns the canonical city name for given coordinates.
     * Returns null if no match can be found or the request fails.
     */
    public function resolveCity(?float $latitude, ?float $longitude): ?string
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        $cityName = $this->fetchNominatimCity($latitude, $longitude);

        if ($cityName === null) {
            return null;
        }

        return $this->matchCanonicalLocation($cityName);
    }

    private function fetchNominatimCity(float $latitude, float $longitude): ?string
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'Lokacara/1.0'])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'json',
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'zoom' => 10,
                ]);

            if (! $response->successful()) {
                Log::warning('Nominatim reverse geocode failed', [
                    'status' => $response->status(),
                    'lat' => $latitude,
                    'lon' => $longitude,
                ]);

                return null;
            }

            $address = $response->json('address');

            if (! $address) {
                return null;
            }

            return $address['city']
                ?? $address['town']
                ?? $address['municipality']
                ?? $address['county']
                ?? $address['village']
                ?? $address['state']
                ?? null;
        } catch (\Throwable $e) {
            Log::warning('Nominatim reverse geocode exception', [
                'message' => $e->getMessage(),
                'lat' => $latitude,
                'lon' => $longitude,
            ]);

            return null;
        }
    }

    private function matchCanonicalLocation(string $cityName): ?string
    {
        $normalized = trim($cityName);

        $locations = Location::select('name')->get()->pluck('name');

        $match = $locations->first(fn ($canonical) => strcasecmp($normalized, $canonical) === 0);

        if ($match) {
            return $match;
        }

        foreach ($locations as $canonical) {
            $keyword = mb_strtolower($canonical);
            $haystack = mb_strtolower($normalized);

            if (
                str_contains($haystack, $keyword) ||
                str_contains($keyword, $haystack)
            ) {
                return $canonical;
            }
        }

        return $normalized;
    }
}
