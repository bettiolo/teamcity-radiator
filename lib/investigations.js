"use strict";
var debug = require('debug')('investigations');
var request = require('request-json');
var _ = require('lodash');
var filter = require('./filter');

function getProjectId(investigation) {
  if (!investigation.scope.buildTypes) {
    return null;
  }
  if (investigation.scope.buildTypes.count > 1) {
    debug('Unexpected multiple build types:', investigation);
  }
  return investigation.scope.buildTypes.buildType[0].id;
}

module.exports.get = function (server, projectPrefix, cb) {
  var serverUrl = 'http://' + server;
  var path = '/guestAuth/app/rest/investigations/';

  var client = request.newClient(serverUrl);
  client.get(path, function (err, response, body) {
    if (err) { return cb(err); }
    if (response.statusCode !== 200) {
      debug('Response not 200:', response);
      return cb(new Error('Response not 200'));
    }
    var filteredInvestigations = filter.byProject(body.investigation, projectPrefix, getProjectId);
    var investigations = {};
    filteredInvestigations.forEach(function (investigation) {
      var projectId = getProjectId(investigation);
      if (projectId) {
        investigations[projectId] = investigation.assignee;
      }
    });
    cb(null, investigations);
  });
};
