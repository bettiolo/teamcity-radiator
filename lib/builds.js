var debug = require('debug')('builds');
var request = require('request-json');
var util = require('util');
var _ = require('lodash');

module.exports.getFailed = function (server, buildTypes, callback) {
    "use strict";

    var failedBuilds = [];
    var buildTypesCount = buildTypes.length;
    var finished = _.after(buildTypesCount, function () {
        var sortedFailedBuilds = _(failedBuilds)
            .sortBy(function (failedBuild) {
                return failedBuild.latestBuild.id;
            })
            .reverse()
            .value();
        callback(sortedFailedBuilds);
    });

    _.forEach(buildTypes, function (buildType) {
        getBuild(server, buildType.id, function(build) {
            if (build && build[0] && build[0].status != 'SUCCESS') {
                debug(util.inspect(build));
                buildType.latestBuild = build[0];
                failedBuilds.push(buildType);
            }
            finished();
        });
    });
};


function getBuild(server, id, callback) {
    // ?locator=status:error,status:running
    // ?locator=status:failure
    // http://<server>/httpAuth/app/rest/buildQueue
    // ?lookupLimit=1

    var serverUrl = 'http://' + server;
    var path = '/guestAuth/app/rest/buildTypes/id:' + id + '/builds/?locator=lookupLimit:1';
    debug('GET ' + serverUrl + path);
    var client = request.newClient(serverUrl);
    client.get(path,
        function parseBuilds(error, response, body) {
            if (error) {
                debug('Error:');
                debug(util.inspect(error));
            }
//            debug('Body:');
//            debug(util.inspect(body));
            if (!error && response.statusCode == 200) {
                callback(body.build);
            } else {
                callback({});
            }
        }
    )
}