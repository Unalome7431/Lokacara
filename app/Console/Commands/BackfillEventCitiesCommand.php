<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

class BackfillEventCitiesCommand extends Command
{
    protected $signature = 'events:backfill-cities';

    protected $description = 'Backfill city for offline events from unambiguous Kota/Kabupaten address components';

    public function handle(): int
    {
        $events = Event::whereNull('city')
            ->where('type', 'offline')
            ->whereNotNull('address')
            ->get();

        if ($events->isEmpty()) {
            $this->info('No events to backfill.');

            return 0;
        }

        $unresolved = [];
        $backfilled = 0;

        foreach ($events as $event) {
            $city = $this->parseCity($event->address);

            if ($city !== null) {
                $event->update(['city' => $city]);
                $backfilled++;
            } else {
                $unresolved[] = "  #{$event->id} \"{$event->title}\" — {$event->address}";
            }
        }

        $this->info("Backfill complete: {$backfilled} events updated.");

        if (! empty($unresolved)) {
            $this->warn(count($unresolved).' events could not be resolved:');
            foreach ($unresolved as $line) {
                $this->line($line);
            }
        }

        return 0;
    }

    private function parseCity(string $address): ?string
    {
        $cleaned = preg_replace('/\s+/', ' ', trim($address));

        $patterns = [
            '/\bKota\s+(.+?)(?:,|\.|$)/iu',
            '/\bKabupaten\s+(.+?)(?:,|\.|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleaned, $matches)) {
                $cityName = trim($matches[1]);

                if (mb_strlen($cityName) < 3 || mb_strlen($cityName) > 50) {
                    continue;
                }

                if (preg_match('/^\d/', $cityName)) {
                    continue;
                }

                return $cityName;
            }
        }

        return null;
    }
}
