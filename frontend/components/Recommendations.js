export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Рекомендации
        </h2>
        <p className="text-gray-600">
          Рекомендации находятся в процессе генерации...
        </p>
      </div>
    );
  }

  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {});

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Персональные рекомендации
      </h2>

      <div className="space-y-8">
        {Object.entries(groupedRecommendations).map(([category, recs]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">
                {getCategoryIcon(category)}
              </span>
              {category}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {recs.map((rec, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Помните
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Эти рекомендации основаны на вашем текущем состоянии. Саморазвитие - это процесс,
                требующий времени и последовательности. Начните с малого и постепенно внедряйте изменения.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category) {
  switch (category.toLowerCase()) {
    case 'личное развитие':
      return '🌱';
    case 'карьера':
      return '💼';
    case 'здоровье':
      return '❤️';
    case 'обучение':
      return '📚';
    default:
      return '🎯';
  }
}