var express = require('express');
var router = express.Router();

var util = require('util');
var setupBuildsRoutes = require('./builds');
var setupFooRoutes = require('./foo');

setupFooRoutes(router);
setupBuildsRoutes(router);

module.exports = router;
