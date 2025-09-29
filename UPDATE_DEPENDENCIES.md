# Обновление зависимостей проекта

## Frontend (React/TypeScript)

### Проверка устаревших пакетов
```bash
cd frontend
npm run check-updates
```

### Обновление всех пакетов
```bash
cd frontend
npm run update-deps
```

### Чистая переустановка (при конфликтах)
```bash
cd frontend
npm run clean-install
```

### Ручное обновление
```bash
cd frontend
npm update
npm audit fix
```

## Backend (PHP/Composer)

### Проверка устаревших пакетов
```bash
cd backend
composer show --outdated
```

### Обновление всех пакетов
```bash
cd backend
composer update
```

### Проверка безопасности
```bash
cd backend
composer audit
```

## Решение конфликтов зависимостей

### Основные проблемы и решения:

1. **Конфликт версий React**: 
   - @nivo пакеты поддерживают React < 19
   - Используем React 18.3.1 для совместимости

2. **Peer dependency warnings**:
   - Используйте `npm install --legacy-peer-deps` при необходимости
   - Или обновите проблемные пакеты до совместимых версий

3. **Устаревшие пакеты**:
   - Регулярно проверяйте `npm outdated`
   - Обновляйте постепенно, тестируя функциональность

## Рекомендации

- Обновляйте зависимости регулярно (раз в месяц)
- Тестируйте приложение после каждого обновления
- Создавайте резервные копии перед крупными обновлениями
- Читайте changelog пакетов перед обновлением
- Используйте семантическое версионирование (^, ~)

## Текущие версии (совместимые)

### Frontend
- React: 18.3.1
- @nivo/*: 0.99.0
- Material-UI: 7.3.x
- TypeScript: 5.8.x
- Vite: 7.x

### Backend  
- PHP: >=8.0
- firebase/php-jwt: ^6.0