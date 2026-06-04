#!/bin/sh
set -e

# Wait for the database connection if DB_CONNECTION is mysql or pgsql
if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MySQL database connection..."
    until php -r "
        try {
            \$host = getenv('DB_HOST') ?: '127.0.0.1';
            \$port = getenv('DB_PORT') ?: '3306';
            \$db   = getenv('DB_DATABASE') ?: 'laravel';
            \$user = getenv('DB_USERNAME') ?: 'root';
            \$pass = getenv('DB_PASSWORD') ?: '';
            new PDO(\"mysql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass);
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        echo "Database is unavailable - sleeping..."
        sleep 2
    done
    echo "Database is online!"
elif [ "$DB_CONNECTION" = "pgsql" ]; then
    echo "Waiting for PostgreSQL database connection..."
    until php -r "
        try {
            \$host = getenv('DB_HOST') ?: '127.0.0.1';
            \$port = getenv('DB_PORT') ?: '5432';
            \$db   = getenv('DB_DATABASE') ?: 'laravel';
            \$user = getenv('DB_USERNAME') ?: 'postgres';
            \$pass = getenv('DB_PASSWORD') ?: '';
            new PDO(\"pgsql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass);
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        echo "Database is unavailable - sleeping..."
        sleep 2
    done
    echo "Database is online!"
fi

# Run migrations (typically only in production/staging environments, or always for local Docker setups)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Configure Laravel caches based on environment
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ]; then
    echo "Caching configuration and routes for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    echo "Clearing caches for development..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
fi

# Ensure storage and bootstrap/cache permissions are correct
echo "Setting correct folder permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Execute the main container command (e.g. php-fpm)
echo "Starting PHP-FPM..."
exec "$@"
