FROM php:8.1-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy backend files
COPY backend/ /var/www/html/
COPY database/ /var/www/html/database/

# Copy simple API
COPY simple-api.php /var/www/html/api.php

# Copy router.php file to handle routing
COPY router.php /var/www/html/router.php

# Create simple API status page
RUN echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CRM API</title></head><body><h1>CRM API Ready</h1><p>API available at: <a href="/api.php">/api.php</a></p></body></html>' > /var/www/html/index.html

WORKDIR /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Expose port
EXPOSE 8080

# Start Apache with dynamic port configuration
CMD ["sh", "-c", "export PORT=${PORT:-8080} && sed -i \"s/Listen 80/Listen $PORT/\" /etc/apache2/ports.conf && apache2-foreground"]