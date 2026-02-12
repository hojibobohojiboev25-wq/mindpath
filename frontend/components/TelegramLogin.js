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
        console.log('Auth response data:', data);
        if (data.success && data.user) {
          // Store auth data and reload to show authenticated state
          localStorage.setItem('telegram_auth', JSON.stringify({
            user: data.user,
            timestamp: Date.now()
          }));
          window.location.reload();
        } else {
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
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  console.log('TelegramLogin component:', {
    botUsername,
    widgetLoaded,
    error,
    envVar: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  });

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
      <div className="telegram-login-widget">
        {/* Fallback manual widget creation */}
        <div id="telegram-login-fallback">
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(function() {
                  try {
                    // Create Telegram login button manually
                    var loginDiv = document.getElementById('telegram-login-fallback');
                    if (loginDiv && !loginDiv.querySelector('script[data-telegram-login]')) {
                      var script = document.createElement('script');
                      script.async = true;
                      script.src = 'https://telegram.org/js/telegram-widget.js?22';
                      script.setAttribute('data-telegram-login', '${botUsername}');
                      script.setAttribute('data-size', 'large');
                      script.setAttribute('data-radius', '8');
                      script.setAttribute('data-auth-url', '');
                      script.setAttribute('data-request-access', 'write');

                      loginDiv.appendChild(script);
                      console.log('Telegram widget script added for bot:', '${botUsername}');
                    }
                  } catch (e) {
                    console.error('Error creating Telegram widget:', e);
                    // Show error message
                    var container = document.getElementById('telegram-login-fallback');
                    if (container) {
                      container.innerHTML = '<div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-red-800">Ошибка загрузки виджета Telegram</p><p class="text-red-600 text-sm">Проверьте настройки бота и домена</p></div>';
                    }
                  }
                }, 1000);
              `,
            }}
          />
        </div>
      </div>

      {!widgetLoaded && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">
            Загрузка виджета Telegram для бота: {botUsername}
          </p>
        </div>
      )}
    </div>
  );
}