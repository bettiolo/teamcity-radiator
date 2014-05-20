var debug = require('debug')('/builds');
var request = require('request-json');
var util = require('util');
var _ = require('lodash');
var buildTypes = require('../lib/buildTypes');

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



module.exports = function setupRoute(router) {
    "use strict";
    /* GET home page. */
    router.get('/:server/:projectPrefix?', function(req, res) {
        buildTypes.getAll(req.params.server, req.params.projectPrefix, function (builds) {

            var failedBuilds = [];
            var buildTypesCount = builds.length;
            var finished = _.after(buildTypesCount, function () {
                res.render('builds', {
                    title: 'Express',
                    server: req.params.server,
                    projectPrefix: req.params.projectPrefix,
                    builds: _(failedBuilds)
                        .sortBy(function (failedBuild) {
                            return failedBuild.latestBuild.id;
                        })
                        .reverse()
                        .value()
                });
            });
            _.forEach(builds, function (buildType) {
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
