import { useState } from 'react';

export default function ProfileSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [step, setStep] = useState(1);

  const avatarOptions = [
    '🧑', '👩', '🧓', '👨', '👩‍🦱', '👨‍🦱', '👩‍🦰', '👨‍🦰',
    '👩‍🦳', '👨‍🦳', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬',
    '👩‍🎨', '👨‍🎨', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '👩‍🌾', '👨‍🌾'
  ];

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleComplete = () => {
    if (avatar) {
      onComplete({
        name: name.trim(),
        avatar: avatar,
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Создайте свой профиль
            </h1>
            <p className="text-gray-600 mt-2">
              Это займет всего минуту!
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${
                step >= 2 ? 'bg-primary-500' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Как вас зовут?
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-lg py-3"
                disabled={!name.trim()}
              >
                Продолжить →
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Привет, {name}! 🎉
                </h2>
                <p className="text-gray-600">
                  Выберите аватар для вашего профиля
                </p>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl hover:scale-110 transition-transform ${
                      avatar === emoji
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary py-3"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 btn-primary py-3"
                  disabled={!avatar}
                >
                  Готово! 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}