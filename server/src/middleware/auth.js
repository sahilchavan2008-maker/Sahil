import { supabase, isMockSupabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing or invalid. Format: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    // Support demo mode / mock token for immediate preview and testing
    if (token === 'demo-mock-token' || token.startsWith('demo-') || isMockSupabase) {
      req.user = {
        id: 'demo-user-123',
        email: 'demo@antifatigue.app',
        role: 'authenticated'
      };
      return next();
    }

    // Live Supabase Auth verification
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token'
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('[Auth Middleware] Verification error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to internal error'
    });
  }
}
