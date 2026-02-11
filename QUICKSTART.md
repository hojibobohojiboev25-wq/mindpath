# 🚀 Быстрый запуск

## Предварительные требования
- Node.js 16+
- Аккаунты: Telegram Bot, OpenAI, Stability AI

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
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=your-bot-username
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
DATABASE_URL=./database.sqlite
```

### frontend/.env.local
```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your-bot-username
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
2. Авторизуйтесь через Telegram
3. Заполните анкету
4. Просмотрите результаты анализа

## 🔧 Troubleshooting

- **Проблемы с авторизацией**: Проверьте токен бота и домен в BotFather
- **Ошибки AI API**: Проверьте ключи и баланс аккаунтов
- **База данных**: Убедитесь в правах доступа к файлу database.sqlite

Подробная документация в README.md