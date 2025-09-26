FROM php:8.1-apache

# Install system dependencies required for PHP extensions and Composer
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite && a2enmod headers

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy application files
COPY . /var/www/html/

# Create .env.local file
RUN echo "# Database configuration" > /var/www/html/.env.local && \
    echo "DB_HOST=mysql" >> /var/www/html/.env.local && \
    echo "DB_PORT=3306" >> /var/www/html/.env.local && \
    echo "DB_NAME=crm_db" >> /var/www/html/.env.local && \
    echo "DB_USER=crm_user" >> /var/www/html/.env.local && \
    echo "DB_PASSWORD=crm_password" >> /var/www/html/.env.local && \
    echo "" >> /var/www/html/.env.local && \
    echo "# JWT configuration" >> /var/www/html/.env.local && \
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this" >> /var/www/html/.env.local && \
    echo "JWT_EXPIRATION=86400" >> /var/www/html/.env.local && \
    echo "" >> /var/www/html/.env.local && \
    echo "# CORS configuration" >> /var/www/html/.env.local && \
    echo "CORS_ALLOWED_ORIGINS=http://localhost:3009,http://localhost:3000" >> /var/www/html/.env.local

# Update Apache configuration to point to public directory
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Directly modify the Apache configuration to allow .htaccess overrides
RUN echo "<Directory /var/www/html/public>" >> /etc/apache2/apache2.conf && \
    echo "    Options Indexes FollowSymLinks" >> /etc/apache2/apache2.conf && \
    echo "    AllowOverride All" >> /etc/apache2/apache2.conf && \
    echo "    Require all granted" >> /etc/apache2/apache2.conf && \
    echo "</Directory>" >> /etc/apache2/apache2.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 755 /var/www/html/

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]