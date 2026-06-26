// module 2 from 3rd party
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('hello ');
});

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
