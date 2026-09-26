import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header with Bearer token'
      });
    }

    const token = authHeader.split(' ')[1];

    // Support Demo token for fast evaluation / testing without Supabase credentials
    if (!isLiveSupabase || token === 'demo-token' || token === 'mock-jwt-token') {
      const demoProfile = memoryStore.profiles.get('demo-user-id');
      req.user = {
        id: demoProfile.id,
        email: demoProfile.email,
        full_name: demoProfile.full_name,
        role: demoProfile.role
      };
      return next();
    }

    // Live Supabase JWT verification
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: error ? error.message : 'User could not be authenticated from token'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Internal Auth Error', message: err.message });
  }
};
