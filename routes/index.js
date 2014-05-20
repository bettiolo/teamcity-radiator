var express = require('express');
var router = express.Router();

var util = require('util');

var setupBuildsRoutes = require('./builds');
var setupFooRoutes = require('./foo');
setupFooRoutes(router);
setupBuildsRoutes(router);

router.get('/', function(req, res) {
  res.status(200).send('<h1>Hello World</h1>');
});

module.exports = router;
