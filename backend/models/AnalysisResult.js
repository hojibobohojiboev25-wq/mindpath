const db = require('./database');

class AnalysisResult {
  // Save questionnaire responses
  static async saveQuestionnaireResponse(userId, responses) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO questionnaire_responses (user_id, responses) VALUES (?, ?)',
        [userId, JSON.stringify(responses)],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Save analysis result
  static async saveAnalysisResult(userId, questionnaireId, analysisData) {
    return new Promise((resolve, reject) => {
      const { personality_analysis, mind_map_data, recommendations, mind_map_image_url } = analysisData;

      db.run(
        `INSERT INTO analysis_results
         (user_id, questionnaire_id, personality_analysis, mind_map_data, recommendations, mind_map_image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          questionnaireId,
          JSON.stringify(personality_analysis),
          JSON.stringify(mind_map_data),
          JSON.stringify(recommendations),
          mind_map_image_url
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Get user's latest analysis result
  static async getLatestByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT ar.*, qr.responses as questionnaire_responses, qr.created_at as questionnaire_date
         FROM analysis_results ar
         JOIN questionnaire_responses qr ON ar.questionnaire_id = qr.id
         WHERE ar.user_id = ?
         ORDER BY ar.created_at DESC
         LIMIT 1`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            // Parse JSON fields
            resolve({
              ...row,
              personality_analysis: JSON.parse(row.personality_analysis),
              mind_map_data: JSON.parse(row.mind_map_data),
              recommendations: JSON.parse(row.recommendations),
              questionnaire_responses: JSON.parse(row.questionnaire_responses)
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  // Get all analysis results for user
  static async getAllByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ar.*, qr.created_at as questionnaire_date
         FROM analysis_results ar
         JOIN questionnaire_responses qr ON ar.questionnaire_id = qr.id
         WHERE ar.user_id = ?
         ORDER BY ar.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => ({
              ...row,
              personality_analysis: JSON.parse(row.personality_analysis),
              mind_map_data: JSON.parse(row.mind_map_data),
              recommendations: JSON.parse(row.recommendations)
            })));
          }
        }
      );
    });
  }
}

module.exports = AnalysisResult;