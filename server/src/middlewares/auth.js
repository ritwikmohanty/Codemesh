import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    const token = req.cookies?.authToken || 
                  (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        debug: 'No authorization header or token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        debug: jwtError.message
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token structure',
        debug: 'Token does not contain userId'
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found',
        debug: 'User associated with token no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    const token = req.cookies?.authToken || 
                  (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (token) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        // For optional auth, silently ignore JWT errors
        return next();
      }

      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-password');
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without failing
  }
};
