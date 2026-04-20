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

const { extractEmbedding } = require('./ai.service');

const addFaceImages = async (userId, images) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  
  for (let imgData of images) {
    const embedding = await extractEmbedding(imgData.data);
    user.faceImages.push({
      data: imgData.data,
      uploadedAt: new Date()
    });
    user.faceEmbedding = embedding; // Latest embedding
  }
  
  await user.save();
  return user;
};

const deleteFaceImages = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.faceImages = [];
  user.faceEmbedding = undefined;
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
  addFaceImages,
  deleteFaceImages,
  deleteUser
};


