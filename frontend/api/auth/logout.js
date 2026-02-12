export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In serverless environment, logout is handled on client side
  // Just return success
  res.json({ success: true });
}