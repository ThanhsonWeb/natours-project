const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkId = (req, res, next, value) => {
  //middleware
  console.log(`Tour id is : ${value}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price ?',
    });
  }
  next();
};

// Handler Route
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id); // get exact tour
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Update tour here....>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
