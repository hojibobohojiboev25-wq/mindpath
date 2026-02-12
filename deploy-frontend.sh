#!/bin/bash

echo "🚀 Развертывание frontend на Vercel..."

# Проверка наличия Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Установка Vercel CLI..."
    npm install -g vercel
fi

# Вход в Vercel (если не авторизован)
echo "🔐 Вход в Vercel..."
vercel login

# Развертывание frontend
echo "📤 Развертывание frontend..."
cd frontend
vercel --prod

echo "✅ Frontend развернут на Vercel!"
echo "🔧 Добавьте переменные окружения в Vercel dashboard:"
echo "   - NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=TrixGo_bot"
echo "   - TELEGRAM_BOT_TOKEN=ваш-бот-токен"
echo "   - OPENAI_API_KEY=ваш-openai-ключ"
echo "   - STABILITY_API_KEY=ваш-stability-ключ"