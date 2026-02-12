# Настройка Telegram бота для авторизации

## 📋 Проверка настроек бота

### 1. Проверьте username бота
Ваш бот: `@TrixGo_bot`
**Username для виджета:** `TrixGo_bot` (БЕЗ @)

### 2. Настройка домена в BotFather

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Выберите вашего бота: `/mybots` → `TrixGo_bot`
3. Выберите: `Bot Settings` → `Domain`
4. Выполните команду: `/setdomain`
5. Введите домен: `mindpath-amber.vercel.app`

**Ожидаемый ответ:**
```
Success! Domain mindpath-amber.vercel.app is set for bot TrixGo_bot
```

### 3. Проверка переменных в Vercel

Убедитесь, что в Vercel установлены:

```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = TrixGo_bot
TELEGRAM_BOT_TOKEN = 8199802315:AAFPCK-0692KRuZLAYjM4SCISaq7VCFpQhU
```

### 4. Тестирование виджета

После настройки:

1. Откройте: https://mindpath-amber.vercel.app
2. Откройте DevTools (F12) → Console
3. Ищите сообщения:
   - ✅ `"Telegram widget script added for bot: TrixGo_bot"`
   - ❌ `"Username invalid"` - проблема с username
   - ❌ `"Error creating Telegram widget"` - проблема с загрузкой

### 5. Возможные проблемы

#### "Username invalid"
- Проверьте username бота (без @)
- Убедитесь, что бот существует
- Проверьте переменную `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`

#### Кнопка не отображается
- Проверьте домен в BotFather
- Убедитесь, что сайт использует HTTPS
- Проверьте консоль на ошибки загрузки скрипта

#### Ошибка авторизации
- Проверьте `TELEGRAM_BOT_TOKEN` в Vercel
- Проверьте логи Vercel Functions
- Убедитесь, что токен правильный

### 6. Ручная проверка виджета

Создайте простой HTML файл для тестирования:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Telegram Widget Test</title>
</head>
<body>
    <h1>Telegram Login Test</h1>
    <script async src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="TrixGo_bot"
            data-size="large">
    </script>
</body>
</html>
```

Сохраните как `test.html` и откройте в браузере. Если кнопка не появляется - проблема с настройками бота.