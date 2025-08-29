import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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
}
