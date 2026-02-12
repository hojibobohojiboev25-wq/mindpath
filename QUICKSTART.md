# 🚀 Быстрый запуск

## Предварительные требования
- Node.js 16+
- Аккаунты: OpenAI, Stability AI

## 1. Установка зависимостей
```bash
npm run install:all
```

## 2. Настройка переменных окружения

### backend/.env
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
JWT_SECRET=change-me
DATABASE_URL=./database.sqlite
```

### frontend/.env.local
```env
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
JWT_SECRET=change-me
```

## 3. Запуск
```bash
# Одновременный запуск фронтенда и бэкенда
npm run dev

# Или по отдельности:
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:3000
```

## 4. Использование

1. Откройте http://localhost:3000
2. Создайте профиль
3. Откройте чат или заполните анкету
4. Просмотрите результаты анализа

## 🔧 Troubleshooting

- **Ошибки AI API**: Проверьте ключи и баланс аккаунтов
- **База данных**: Убедитесь в правах доступа к файлу database.sqlite

Подробная документация в README.md