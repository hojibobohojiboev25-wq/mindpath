export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In serverless environment, we can't maintain real sessions
  // Check if user has been authenticated in this session
  // For now, always return not authenticated to show login button

  res.status(401).json({ error: 'Not authenticated' });
}