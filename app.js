// module 2 from 3rd party
const express = require('express');

const app = express();
// Get
app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello', app: 'Natours' });
});

//POST
app.post('/', (req, res) => {
  res.send('you can post to this endpoint... ');
});

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
