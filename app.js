const express = require('express');

const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 Middleware
app.use(morgan('dev'));

app.use(express.json());
// Create our own middleware
// Middleware apply to  every request
app.use((req, res, next) => {
  console.log('hello from middleware 🌟');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// 2. Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
