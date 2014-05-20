var debug = require('debug')('/builds');
var buildTypesClient = require('../lib/buildTypesClient');
var buildsClient = require('../lib/buildsClient');

module.exports = function setupRoute(router) {
    "use strict";
    /* GET home page. */

    router.get('/:server/:projectPrefix?', function(req, res) {
        var server = req.params.server;
        var projectPrefix = req.params.projectPrefix;
        buildTypesClient.getAll(server, projectPrefix, function (allBuildTypes) {
            buildsClient.getFailed(server, allBuildTypes, function (failedBuilds) {
                buildTypesClient.sortBuildTypesByLatestBuild(failedBuilds, function(sortedFailedBuids) {
                    res.render('builds', {
                        title: 'Express',
                        server: server,
                        projectPrefix: projectPrefix,
                        builds: sortedFailedBuids,
                        updated: new Date().getTime()
                    });
                });
            })
        });
    });
};
