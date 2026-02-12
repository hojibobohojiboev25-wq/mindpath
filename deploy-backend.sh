#!/bin/bash

echo "🚀 Развертывание backend на Railway..."

# Проверить наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Установка Railway CLI..."
    npm install -g @railway/cli
fi

# Войти в Railway
echo "🔐 Вход в Railway..."
railway login

# Инициализировать проект
echo "📁 Инициализация проекта..."
cd backend
railway init

# Инструкции по добавлению переменных окружения
echo "🔑 Добавьте переменные окружения в Railway Dashboard:"
echo "   PORT=3001"
echo "   FRONTEND_URL=https://mindpath-amber.vercel.app"
echo "   SESSION_SECRET=ваш-секретный-ключ"
echo "   TELEGRAM_BOT_TOKEN=ваш-telegram-bot-token"
echo "   TELEGRAM_BOT_USERNAME=TrixGo_bot"
echo "   OPENAI_API_KEY=ваш-openai-api-key"
echo "   STABILITY_API_KEY=ваш-stability-api-key"
echo "   DATABASE_URL=./database.sqlite"

# Развернуть
echo "🚀 Разверните проект командой:"
echo "   railway up"

# Получить URL
echo "🌐 После развертывания получите URL командой:"
echo "   railway domain"

echo "✅ Следуйте инструкциям в VERCEL_SETUP.md для завершения настройки!"