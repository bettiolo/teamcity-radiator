var debug = require('debug')('builds');
var request = require('request-json');
var _ = require('lodash');

module.exports.getFailed = function (server, buildTypeIds, callback) {
  "use strict";

  var failedBuilds = [];
  var buildTypesCount = buildTypeIds.length;
  if (buildTypesCount === 0) {
    return callback(failedBuilds);
  }
  var finished = _.after(buildTypesCount, function () {
    return callback(failedBuilds);
  });

  var serverUrl = 'http://' + server;
  var client = request.newClient(serverUrl);
  _.forEach(buildTypeIds, function (buildTypeId) {
    getLatestBuild(client, buildTypeId, function (build) {
      if (build && build.status != 'SUCCESS' && build.status != 'UNKNOWN') {
        failedBuilds.push(build);
      }
      finished();
    })
  });
};

function getLatestBuild(client, buildTypeId, callback) {
  "use strict";

  // ?locator=status:error,status:running,status:failure
  // http://<server>/httpAuth/app/rest/buildQueue
  var path = '/guestAuth/app/rest/buildTypes/id:' + buildTypeId + '/builds/?locator=lookupLimit:1';
  client.get(path, function (error, response, body) {
    if (error) {
      debug('Error:', error);
    }
    var build;
    if (!error && response.statusCode == 200) {
      var builds = body.build;
      if (builds && builds[0]) {
        build = builds[0];
      }
    }
    callback(build);
  });
}
