import { useEffect } from 'react';

export default function TelegramLogin({ onLogin }) {
  useEffect(() => {
    // Load Telegram Login Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    document.head.appendChild(script);

    // Clean up script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Handle Telegram login callback
  useEffect(() => {
    const handleTelegramAuth = async (user) => {
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(user),
        });

        if (response.ok) {
          const data = await response.json();
          onLogin(data.user);
        } else {
          console.error('Telegram auth failed');
          alert('Ошибка авторизации через Telegram');
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
        alert('Ошибка авторизации через Telegram');
      }
    };

    // Make handleTelegramAuth available globally for Telegram widget
    window.handleTelegramAuth = handleTelegramAuth;

    return () => {
      delete window.handleTelegramAuth;
    };
  }, [onLogin]);

  return (
    <div className="flex justify-center">
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.handleTelegramAuth = function(user) {
              fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(user),
              })
              .then(response => response.json())
              .then(data => {
                if (data.success && data.user) {
                  // Store auth data and reload to show authenticated state
                  localStorage.setItem('telegram_auth', JSON.stringify({
                    user: data.user,
                    timestamp: Date.now()
                  }));
                  window.location.reload();
                } else {
                  alert('Ошибка авторизации');
                }
              })
              .catch(error => {
                console.error('Auth error:', error);
                alert('Ошибка авторизации');
              });
            };
          `,
        }}
      />

      {/* Telegram Login Widget */}
      <div
        id="telegram-login-widget"
        dangerouslySetInnerHTML={{
          __html: `
            <script async src="https://telegram.org/js/telegram-widget.js?22"
                    data-telegram-login="${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot_username'}"
                    data-size="large"
                    data-radius="8"
                    data-auth-url=""
                    data-request-access="write">
            </script>
          `,
        }}
      />
    </div>
  );
}