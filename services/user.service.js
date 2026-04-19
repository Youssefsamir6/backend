const User = require('../models/User.model');

const getAllUsers = async () => {
  return await User.find().select('-password');
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const createUser = async ({ email, password, role }) => {
  const user = new User({ email, password, role });
  await user.save();
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  Object.assign(user, updateData);
  if (updateData.password) {
    user.password = updateData.password; // pre-save will hash
  }
  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  await user.deleteOne();
  return { message: 'User deleted' };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

