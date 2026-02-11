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
echo "🔧 Не забудьте добавить переменные окружения в Vercel dashboard:"
echo "   - NEXT_PUBLIC_TELEGRAM_BOT_USERNAME"
echo "   - BACKEND_URL (URL вашего backend сервера)"