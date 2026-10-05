import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header. Bearer token required.'
      });
    }

    const token = authHeader.split(' ')[1];

    // If Supabase keys are configured, verify with Supabase Auth
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid, expired, or revoked authentication token.'
        });
      }

      req.user = user;
      return next();
    }

    // Fallback in demo/development mode if no credentials configured yet
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'demo@croppilot.ai' };
      return next();
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication service not configured.'
    });
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};
