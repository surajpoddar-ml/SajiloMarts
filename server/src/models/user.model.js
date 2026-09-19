import mongoose from 'mongoose';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const User = mongoose.model('User', userSchema);
export default User;
