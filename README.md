# Loyalty-api

Предоставляет API для работы с процессингом лояльности

## Зависимости

- docker-ce
- docker-compose-plugin

## Сборка контейнера

```
git clone https://github.com/timurkonic/loyalty-api
cd loyalty-api
docker compose build
```

## Окружение

Ожидаются следующие переменные окружения:

- DBHOST - адрес сервера MySQL
- DBNAME - название БД MySQL
- DBUSER - пользователь MySQL
- DBPASS - пароль MySQL
- APIKEY - ключ API, ожидаемый от клиентов
- PORT - порт
