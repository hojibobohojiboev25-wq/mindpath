const express = require('express');
const { requireAuth } = require('../middleware/auth');
const AnalysisResult = require('../models/AnalysisResult');

const router = express.Router();

// GET /api/results/latest - Get user's latest analysis result
router.get('/latest', requireAuth, async (req, res) => {
  try {
    const result = await AnalysisResult.getLatestByUserId(req.session.userId);

    if (!result) {
      return res.status(404).json({ error: 'No analysis results found' });
    }

    res.json({
      result: {
        id: result.id,
        personalityAnalysis: result.personality_analysis,
        mindMapData: result.mind_map_data,
        recommendations: result.recommendations,
        mindMapImageUrl: result.mind_map_image_url,
        createdAt: result.created_at,
        questionnaireDate: result.questionnaire_date
      }
    });

  } catch (error) {
    console.error('Get latest result error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
});

// GET /api/results/all - Get all user's analysis results
router.get('/all', requireAuth, async (req, res) => {
  try {
    const results = await AnalysisResult.getAllByUserId(req.session.userId);

    res.json({
      results: results.map(result => ({
        id: result.id,
        personalityAnalysis: result.personality_analysis,
        recommendations: result.recommendations,
        mindMapImageUrl: result.mind_map_image_url,
        createdAt: result.created_at,
        questionnaireDate: result.questionnaire_date
      }))
    });

  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
});

// GET /api/results/:id - Get specific analysis result
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const resultId = req.params.id;

    // Get result and verify it belongs to the user
    const result = await new Promise((resolve, reject) => {
      const db = require('../models/database');
      db.get(
        `SELECT ar.*, qr.responses as questionnaire_responses, qr.created_at as questionnaire_date
         FROM analysis_results ar
         JOIN questionnaire_responses qr ON ar.questionnaire_id = qr.id
         WHERE ar.id = ? AND ar.user_id = ?`,
        [resultId, req.session.userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!result) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }

    res.json({
      result: {
        id: result.id,
        personalityAnalysis: JSON.parse(result.personality_analysis),
        mindMapData: JSON.parse(result.mind_map_data),
        recommendations: JSON.parse(result.recommendations),
        mindMapImageUrl: result.mind_map_image_url,
        questionnaireResponses: JSON.parse(result.questionnaire_responses),
        createdAt: result.created_at,
        questionnaireDate: result.questionnaire_date
      }
    });

  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to get analysis result' });
  }
});

module.exports = router;