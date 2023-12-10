const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc   GET all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // copy  req.query
  const reqQuery = { ...req.query };
  // fields to exclude
  const removeFields = ['select', 'sort'];

  //loop over remove fields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);
  // create operators
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  // finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
    console.log(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // executing query
  const bootcamps = await query;

  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc   GET single bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc   Update new bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Delete bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get let/lng geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378km
  // zipcode for check 02118
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
