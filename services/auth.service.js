const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

const register = async ({ email, password, role = 'user' }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const user = new User({ email, password, role });
  await user.save();

  const token = generateToken(user._id, user.role);
  return { user: { id: user._id, email, role }, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, user.role);
  return { user: { id: user._id, email, role: user.role }, token };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
};

module.exports = { register, login, verifyToken, generateToken };

