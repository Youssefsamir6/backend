const { register, login } = require('../services/auth.service');

const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const { user, token } = await register({ email, password, role });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login({ email, password });
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };

