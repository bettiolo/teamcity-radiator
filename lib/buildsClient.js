var debug = require('debug')('builds');
var request = require('request-json');
var util = require('util');
var _ = require('lodash');

module.exports.getFailed = function (server, buildTypes, callback) {
    "use strict";

    var failedBuilds = [];
    var buildTypesCount = buildTypes.length;
    var finished = _.after(buildTypesCount, function () {
        callback(failedBuilds);
    });

    var serverUrl = 'http://' + server;
    var client = request.newClient(serverUrl);
    _.forEach(buildTypes, function (buildType) {
        // ?locator=status:error,status:running,status:failure
        // http://<server>/httpAuth/app/rest/buildQueue
        var path = '/guestAuth/app/rest/buildTypes/id:' + buildType.id + '/builds/?locator=lookupLimit:1';
        debug('GET ' + serverUrl + path);
        client.get(path, function (error, response, body) {
            if (error) {
                debug('Error:');
                debug(util.inspect(error));
            }
            // debug('Body:');
            // debug(util.inspect(body));
            if (!error && response.statusCode == 200) {
                var build = parseBuild(body.build);
                if (build) {
                    buildType.latestBuild = build;
                    failedBuilds.push(buildType);
                }
            }
            finished();
        });
    });
};

function parseBuild(build) {
    "use strict";

    if (build && build[0] && build[0].status != 'SUCCESS') {
        debug(util.inspect(build));
        return build[0];
    }
}