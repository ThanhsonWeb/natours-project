const express = require('express');

const morgan = require('morgan');
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/tourRoutes")

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


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
