import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const syncRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many sync requests, please try again later'
  }
});

// Per-user rate limit: 3 syncs per 15 minutes per authenticated user
const syncAllUserRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  keyGenerator: (req) => {
    // Only rate limit authenticated users by user ID
    return req.user?._id ? `user:${req.user._id.toString()}` : null;
  },
  skip: (req) => !req.user?._id, // Skip if not authenticated
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60);
    res.status(429).json({
      success: false,
      message: `Personal sync limit reached. Please try again in ${retryAfter} minutes.`,
      retryAfter: retryAfter,
      isRateLimited: true,
      limitType: 'user'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-IP rate limit: 3 syncs per 15 minutes per IP (safety net)
const syncAllIpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 3,
  keyGenerator: (req) => `ip:${ipKeyGenerator(req)}`, // Use proper IPv6-safe key generator
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60);
    res.status(429).json({
      success: false,
      message: `IP sync limit reached. Please try again in ${retryAfter} minutes.`,
      retryAfter: retryAfter,
      isRateLimited: true,
      limitType: 'ip'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Combined middleware that enforces both user and IP limits
export const syncAllRateLimit = (req, res, next) => {
  // First check user-based limit (if authenticated)
  syncAllUserRateLimit(req, res, (err) => {
    if (err || res.headersSent) {
      return; // User limit exceeded, response already sent
    }
    
    // Then check IP-based limit
    syncAllIpRateLimit(req, res, (err) => {
      if (err || res.headersSent) {
        return; // IP limit exceeded, response already sent
      }
      
      // Both limits passed, continue
      next();
    });
  });
};
