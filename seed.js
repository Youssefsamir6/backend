require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User.model');

connectDB();

const seedUsers = async () => {
  try {
    await User.deleteMany();
    
    const users = [
      { email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { email: 'guard@test.com', password: 'guard123', role: 'guard' },
      { email: 'user@test.com', password: 'user123', role: 'user' }
    ];

    for (let userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();

