var debug = require('debug')('buildTypes');
var request = require('request-json');
var util = require('util');
var _ = require('lodash');

module.exports.getAll = function (server, projectPrefix, callback) {
    "use strict";
    var serverUrl = 'http://' + server;
    var path = '/guestAuth/app/rest/buildTypes/';
    debug('GET ' + serverUrl + path);

    var client = request.newClient(serverUrl);
    client.get(path, function (error, response, body) {
        if (error) {
            debug('Error:');
            debug(util.inspect(error));
        }
        // debug('Body:');
        // debug(util.inspect(body));
        if (!error && response.statusCode == 200) {
            parseBuildTypesResponse(body.buildType, projectPrefix, callback)
        } else {
            callback({});
        }
    });
};

function parseBuildTypesResponse(allBuildTypes, projectPrefix, callback) {
    "use strict";
    var matchedBuildTypes = [];
    if (projectPrefix) {
        projectPrefix = projectPrefix.toUpperCase();
        var projectPrefixLength = projectPrefix.length;
        matchedBuildTypes = _.filter(allBuildTypes, function (buildType) {
            return buildType.projectId.substr(0, projectPrefixLength).toUpperCase() == projectPrefix;
        });
    } else {
        matchedBuildTypes = allBuildTypes;
    }
    callback(matchedBuildTypes);
}
