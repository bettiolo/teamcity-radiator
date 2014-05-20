var debug = require('debug')('/builds');
var request = require('request-json');
var util = require('util');
var _ = require('lodash');

function getBuild(server, id, callback) {
    // ?locator=status:error,status:running
    // ?locator=status:failure
    // http://<server>/httpAuth/app/rest/buildQueue
    // ?lookupLimit=1

    // last build per client
    // /guestAuth/app/rest/buildTypes/id:ApiTeam_ApiLiveEnvironmentTests_GZipEnabled/builds/?locator=lookupLimit:1
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

function getBuildTypes(server, callback) {
    var serverUrl = 'http://' + server;
    var path = '/guestAuth/app/rest/buildTypes/';
    debug('GET ' + serverUrl + path);
    var client = request.newClient(serverUrl);
    client.get(path,
        function parseBuildTypes(error, response, body) {
            if (error) {
              debug('Error:');
              debug(util.inspect(error));
            }
//            debug('Body:');
//            debug(util.inspect(body));
            if (!error && response.statusCode == 200) {
                callback(body.buildType);
            } else {
                callback({});
            }
        }
    )
}

module.exports = function setupRoute(router) {
    "use strict";
    /* GET home page. */
    router.get('/:server/:prefix?', function(req, res) {
        getBuildTypes(req.params.server, function (builds) {
            var matchedBuildTypes = builds;
            if (req.params.prefix) {
                matchedBuildTypes = _.filter(builds, function (build) {
                   return build.projectId.substr(0, req.params.prefix.length).toUpperCase()
                          == req.params.prefix.toUpperCase();
                });
            }
            var failedBuilds = [];
            var buildTypesCount = matchedBuildTypes.length;
            var finished = _.after(buildTypesCount, function () {
                res.render('index', {
                    title: 'Express',
                    server: req.params.server,
                    prefix: req.params.prefix,
                    builds: _(failedBuilds)
                        .sortBy(function (failedBuild) {
                            return failedBuild.latestBuild.id;
                        })
                        .reverse()
                        .value()
                });
            });
            _.forEach(matchedBuildTypes, function (buildType) {
                getBuild(req.params.server, buildType.id, function(build) {
                    if (build && build[0] && build[0].status != 'SUCCESS') {
                        debug(util.inspect(build));
                        buildType.latestBuild = build[0];
                        failedBuilds.push(buildType);
                    }
                    finished();
                });
            });
        });
    });
};
