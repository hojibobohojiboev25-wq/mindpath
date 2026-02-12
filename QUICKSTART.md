# 🚀 Быстрый запуск

## Предварительные требования
- Node.js 18+
- Аккаунты: OpenAI, Stability AI (по желанию для полного функционала)

## 1. Установка зависимостей (frontend)
```bash
cd frontend
npm install
```

## 2. Настройка переменных окружения (frontend/.env.local)
```env
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
JWT_SECRET=change-me
USE_BACKEND_PROXY=false
BACKEND_URL=
```

## 3. Запуск (frontend)
```bash
cd frontend
npm run dev   # http://localhost:3000
```

## 4. Использование

1. Откройте http://localhost:3000
2. Создайте профиль
3. Откройте чат или заполните анкету
4. Просмотрите результаты анализа

## 🔧 Troubleshooting

- **Ошибки AI API**: Проверьте ключи в `.env.local`/Vercel
- **Прокси /api**: не включайте `USE_BACKEND_PROXY`, если нет отдельного бэкенда

Подробная документация в README.md