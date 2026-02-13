import { request } from './client';

export function submitQuestionnaire(payload) {
  return request('/questionnaire/submit', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getQuestionnaireQuestions() {
  return request('/questionnaire/questions');
}

export function getQuestionnaireStatus(submissionId) {
  return request(`/questionnaire/status/${submissionId}`);
}

export function getLatestResult(profileId) {
  return request(`/results/latest?profileId=${encodeURIComponent(profileId)}`);
}

export function updateMindMap(analysisResultId, data) {
  return request(`/mind-map/${analysisResultId}`, {
    method: 'PATCH',
    body: JSON.stringify({ data })
  });
}
