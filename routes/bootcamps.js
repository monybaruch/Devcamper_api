const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  BootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');

//Include other ressource routers

const courseRouther = require('./courses');

const router = express.Router();

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouther);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(BootcampPhotoUpload);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;
