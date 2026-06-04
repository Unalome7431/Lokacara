# --- Stage 1: Build PHP, Composer & Frontend Assets ---
FROM php:8.4-alpine AS builder
WORKDIR /app

# Install system dependencies, Node.js, and npm
RUN sed -i 's/https/http/g' /etc/apk/repositories \
    && apk add --no-cache nodejs npm git

# Install PHP extensions helper and required extensions for bootstrapping Laravel
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql pdo_pgsql pgsql bcmath zip opcache exif gd redis intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy composer files and install packages
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# Copy package files and install npm packages
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate the autoload files before running npm run build (since wayfinder needs artisan)
RUN composer dump-autoload --optimize --no-dev

# Build Vite assets (this runs php artisan wayfinder:generate internally)
RUN npm run build

# --- Stage 2: PHP-FPM Production Environment ---
FROM php:8.4-fpm-alpine AS app

# Switch Alpine repositories to http to avoid build time TLS errors
RUN sed -i 's/https/http/g' /etc/apk/repositories

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions helper
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install PHP extensions required by Laravel and dependencies
RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    bcmath \
    zip \
    opcache \
    exif \
    gd \
    redis \
    intl

# Copy Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy application code
COPY . .

# Copy vendor, compiled assets, and wayfinder-generated routes from the builder stage
COPY --from=builder /app/vendor ./vendor
COPY --from=builder /app/public/build ./public/build
COPY --from=builder /app/resources/js/wayfinder ./resources/js/wayfinder
COPY --from=builder /app/routes.json ./routes.json

# Optimize autoloading again to clean up path differences
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# Copy and configure entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Fix storage/bootstrap cache permissions for PHP-FPM (www-data)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose PHP-FPM default port
EXPOSE 9000

# Set entrypoint and default command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
