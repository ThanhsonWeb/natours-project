
const express = require('express');
const fs = require('fs');

const app = express();

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

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
