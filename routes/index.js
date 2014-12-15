var express = require('express');
var router = express.Router();

var setupBuildsRoutes = require('./builds');
setupBuildsRoutes(router);

router.get('/', function (req, res) {
  res.status(200).send('<h1>Please specify a server name / build name in the url</h1>');
});

module.exports = router;
