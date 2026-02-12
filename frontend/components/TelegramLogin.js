import { useEffect, useState } from 'react';

export default function TelegramLogin({ onLogin }) {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Telegram Login Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;

    script.onload = () => {
      console.log('Telegram widget script loaded');
      setWidgetLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Telegram widget script');
      setError('Не удалось загрузить виджет Telegram');
    };

    document.head.appendChild(script);

    // Set up global callback function
    window.handleTelegramAuth = function(user) {
      console.log('Telegram auth callback received:', user);

      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })
      .then(response => {
        console.log('Auth response status:', response.status);
        return response.json();
      })
              .then(data => {
                console.log('📥 Auth response data:', data);
                if (data.success && data.user) {
                  // Store auth data
                  const authData = {
                    user: data.user,
                    timestamp: Date.now()
                  };

                  try {
                    localStorage.setItem('telegram_auth', JSON.stringify(authData));
                    console.log('✅ Auth data saved to localStorage:', authData);

                    // Show success message
                    alert('Авторизация успешна! Перенаправление в личный кабинет...');

                    // Force redirect to dashboard
                    setTimeout(() => {
                      console.log('🚀 Redirecting to dashboard...');
                      window.location.href = '/dashboard';
                    }, 1500);
                  } catch (storageError) {
                    console.error('❌ localStorage error:', storageError);
                    alert('Ошибка сохранения данных авторизации');
                  }
                } else {
                  console.error('❌ Auth failed:', data.error);
                  alert('Ошибка авторизации: ' + (data.error || 'Неизвестная ошибка'));
                }
              })
      .catch(error => {
        console.error('Auth error:', error);
        alert('Ошибка сети при авторизации');
      });
    };

    // Clean up
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.handleTelegramAuth;
    };
  }, []);

  // Get bot username from environment
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrixGo_bot'; // Temporary fallback

  console.log('🔍 TelegramLogin Debug:', {
    botUsername,
    widgetLoaded,
    error,
    originalEnvVar: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    isEnvVarDefined: typeof process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME !== 'undefined',
    envVarValue: `"${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}"`,
    usingFallback: !process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  });

  // Temporarily disable the check to test widget loading
  // if (!botUsername) {
  //   return (
  //     <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  //       <p className="text-yellow-800 font-medium">Конфигурация бота не завершена</p>
  //       <p className="text-yellow-600 text-sm mt-1">
  //         Переменная окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME не установлена
  //       </p>
  //       <div className="mt-3 text-left bg-gray-100 p-2 rounded text-xs font-mono">
  //         <p><strong>Что нужно сделать:</strong></p>
  //         <ol className="list-decimal list-inside mt-1 space-y-1">
  //           <li>Зайти в Vercel Dashboard</li>
  //           <li>Выбрать проект mindpath</li>
  //           <li>Settings → Environment Variables</li>
  //           <li>Добавить: <code>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = TrixGo_bot</code></li>
  //           <li>Пересобрать проект</li>
  //         </ol>
  //       </div>
  //       <div className="mt-3 flex gap-2">
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
  //         >
  //           Проверить снова
  //         </button>
  //         <button
  //           onClick={() => window.open('/api/debug/env', '_blank')}
  //           className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
  //         >
  //           Проверить настройки
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Ошибка загрузки виджета Telegram</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!botUsername) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">Конфигурация бота не завершена</p>
        <p className="text-yellow-600 text-sm mt-1">
          Переменная окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME не установлена
        </p>
        <div className="mt-3 text-left bg-gray-100 p-2 rounded text-xs font-mono">
          <p><strong>Что нужно сделать:</strong></p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Зайти в Vercel Dashboard</li>
            <li>Выбрать проект mindpath</li>
            <li>Settings → Environment Variables</li>
            <li>Добавить: <code>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = TrixGo_bot</code></li>
            <li>Пересобрать проект</li>
          </ol>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Проверить снова
          </button>
          <button
            onClick={() => window.open('/api/debug/env', '_blank')}
            className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Проверить настройки
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {/* Telegram Login Widget */}
      <div className="text-center">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Авторизация через Telegram
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Бот: @{botUsername}
          </p>
        </div>

        {/* Standard Telegram widget */}
        <script
          async
          src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login={botUsername}
          data-size="large"
          data-radius="8"
          data-auth-url=""
          data-request-access="write"
        ></script>

        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <p>🔍 Debug: botUsername = "{botUsername}"</p>
          <p>🌐 Domain: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
        </div>
      </div>
    </div>
  );
}