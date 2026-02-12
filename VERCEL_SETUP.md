# Настройка Vercel для работы с Telegram авторизацией

## 📋 Текущий статус:
- ✅ Frontend развернут: https://mindpath-amber.vercel.app
- ✅ Telegram бот настроен на домен
- ❌ Backend не развернут - нужна настройка

## 🚀 Развертывание Backend

### Вариант 1: Railway (Рекомендуется)

1. **Создайте аккаунт** на [Railway.app](https://railway.app)
2. **Установите Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Разверните backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Добавьте переменные окружения в Railway:**
   ```
   PORT=3001
   FRONTEND_URL=https://mindpath-amber.vercel.app
   SESSION_SECRET=ваш-секретный-ключ
   TELEGRAM_BOT_TOKEN=ваш-telegram-bot-token
   TELEGRAM_BOT_USERNAME=TrixGo_bot
   OPENAI_API_KEY=ваш-openai-api-key
   STABILITY_API_KEY=ваш-stability-api-key
   DATABASE_URL=./database.sqlite
   ```

5. **Получите URL backend:**
   ```bash
   railway domain
   ```

### Вариант 2: Render

1. Создайте аккаунт на [Render.com](https://render.com)
2. Подключите GitHub репозиторий
3. Выберите backend папку
4. Добавьте переменные окружения

## 🔧 Обновление Vercel

После развертывания backend:

1. **Зайдите в Vercel Dashboard**
2. **Выберите проект** mindpath
3. **Settings → Environment Variables**
4. **Обновите BACKEND_URL:**
   ```
   BACKEND_URL=https://ваш-backend-url.up.railway.app/api
   ```

## ✅ Проверка работы

1. **Откройте:** https://mindpath-amber.vercel.app
2. **Нажмите "Войти через Telegram"**
3. **Авторизация должна работать**

## 🔍 Отладка

Если авторизация не работает:

1. **Проверьте консоль браузера** на ошибки
2. **Проверьте Railway логи:**
   ```bash
   railway logs
   ```
3. **Проверьте переменные окружения** в Railway/Vercel