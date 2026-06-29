const express = require('express');
const {
  getAllUsers,
  createUser,
  getUse,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// Routes

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
