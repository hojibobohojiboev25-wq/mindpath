const { getStore } = require('../../lib/runtimeStore');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const profileId = req.query.profileId;
    const store = getStore();
    const byProfile = (store.analysisResults && profileId)
      ? store.analysisResults[profileId] || []
      : [];
    const fallback = Object.values(store.analysisResults || {}).flat();
    const latest = (byProfile.length ? byProfile : fallback).slice(-1)[0];

    if (!latest) {
      return res.status(404).json({ error: 'No analysis results found' });
    }

    res.json({
      result: {
        id: latest.id,
        personalityAnalysis: latest.personalityAnalysis,
        mindMapData: latest.mindMapData,
        recommendations: latest.recommendations,
        mindMapImageUrl: latest.mindMapImageUrl,
        createdAt: latest.createdAt,
        questionnaireDate: latest.questionnaireDate
      }
    });

  } catch (error) {
    console.error('Get latest result error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
}

module.exports = handler;