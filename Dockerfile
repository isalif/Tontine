FROM php:8.1-apache

# Extensions PHP nécessaires
RUN docker-php-ext-install pdo pdo_mysql

# Modules Apache
RUN a2enmod rewrite headers

WORKDIR /var/www/html

# Sécurité PHP de base
RUN printf '%s\n' \
        'expose_php=Off' \
        'display_errors=Off' \
        'log_errors=On' \
        'session.use_strict_mode=1' \
        'session.use_only_cookies=1' \
        'session.cookie_httponly=1' \
        'session.cookie_samesite=Lax' \
    > /usr/local/etc/php/conf.d/tontine-security.ini

# Autoriser le .htaccess à la racine (comme sur un hébergement mutualisé classique) ;
# src/ et db/ restent bloqués même si .htaccess est un jour désactivé (défense en profondeur).
RUN printf '<Directory /var/www/html/>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
<Directory /var/www/html/src/>\n\
    Require all denied\n\
</Directory>\n\
<Directory /var/www/html/db/>\n\
    Require all denied\n\
</Directory>\n' > /etc/apache2/conf-available/docker-vhost.conf \
    && a2enconf docker-vhost

COPY . /var/www/html

RUN mkdir -p /var/www/html/uploads/avatars \
    && chown -R www-data:www-data /var/www/html/uploads
