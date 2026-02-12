export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In serverless environment, we can't maintain sessions
  // For demo purposes, return mock user
  const mockUser = {
    id: 1,
    username: 'demo_user',
    firstName: 'Demo',
    lastName: 'User',
    avatarUrl: null
  };

  res.json({
    user: {
      id: mockUser.id,
      username: mockUser.username,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      avatarUrl: mockUser.avatarUrl
    }
  });
}