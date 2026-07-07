const express = require('express');
// const tourController = require('../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('../controllers/tourController');



const tourRouter = express.Router();
// create checkId middleware function
// if the id > tours.length -> res(invalid) -> 404
tourRouter.param('id', checkId);

// Routes
tourRouter.route('/').get(getAllTours).post(checkBody, createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
