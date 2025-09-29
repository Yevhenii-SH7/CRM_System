# Деплой на Render через Docker Hub

## 1. Подготовка Docker Hub

1. Создайте аккаунт на [Docker Hub](https://hub.docker.com)
2. Войдите в Docker:
   ```bash
   docker login
   ```

## 2. Обновите скрипт

Отредактируйте `docker-build.sh`:
```bash
DOCKER_USERNAME="ваш-docker-username"
```

## 3. Соберите и загрузите образ

```bash
./docker-build.sh
```

## 4. Создайте сервис в Render

1. Перейдите в Render Dashboard
2. New + → Web Service
3. Deploy an existing image from a registry
4. Image URL: `ваш-docker-username/crm-task-planner:latest`

## 5. Настройте переменные окружения

```
JWT_SECRET=<автогенерируемый>
DB_HOST=<из базы данных>
DB_PORT=<из базы данных>  
DB_NAME=<из базы данных>
DB_USER=<из базы данных>
DB_PASSWORD=<из базы данных>
```

## 6. Создайте базу данных

New + → PostgreSQL → подключите к веб-сервису