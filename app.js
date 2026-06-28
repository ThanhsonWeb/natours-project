const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1 Middleware

app.use(morgan("dev"))

app.use(express.json()); // get access to req.body

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);
// 2. Handler Route
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  // console.log(req.params);

  const id = Number(req.params.id);

  const tour = tours.find((el) => el.id === id); // get exact tour

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  // here
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1; // 9
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  // overwrite this file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Update tour here....>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// 3. Routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);



app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
