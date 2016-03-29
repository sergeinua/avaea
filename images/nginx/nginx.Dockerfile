FROM nginx

COPY ./images/nginx/config/demo /etc/nginx/conf.d/default.conf

COPY ./images/nginx/config/abo /etc/nginx/conf.d/abo.conf

