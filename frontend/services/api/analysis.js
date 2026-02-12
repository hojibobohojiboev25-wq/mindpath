import { request } from './client';

export function submitQuestionnaire(payload) {
  return request('/api/questionnaire/submit', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getQuestionnaireQuestions() {
  return request('/api/questionnaire/questions');
}

export function getQuestionnaireStatus(submissionId) {
  return request(`/api/questionnaire/status/${submissionId}`);
}

export function getLatestResult(profileId) {
  return request(`/api/results/latest?profileId=${encodeURIComponent(profileId)}`);
}

export function updateMindMap(analysisResultId, data) {
  return request(`/api/mind-map/${analysisResultId}`, {
    method: 'PATCH',
    body: JSON.stringify({ data })
  });
}
