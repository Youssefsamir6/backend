const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../services/user.service');

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createNewUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateExistingUser = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteExistingUser = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser
};

