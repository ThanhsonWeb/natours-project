const express = require('express');
const fs = require('fs');

const app = express();
// simple middleware
app.use(express.json());

// b1 : Ensure it's JavaScript object.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

app.get('/api/v1/tours', (req, res) => {
  // b2 send back to client
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
// create new one
app.post('/api/v1/tours', (req, res) => {
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
});

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
