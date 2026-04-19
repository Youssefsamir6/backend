const { verifyToken } = require('../services/auth.service');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Role '${req.user.role}' not authorized` });
  }
  next();
};

module.exports = { authenticateToken, authorizeRoles };

