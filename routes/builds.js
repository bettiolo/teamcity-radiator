var debug = require('debug')('/builds');
var buildTypesClient = require('../lib/buildTypesClient');
var buildsClient = require('../lib/buildsClient');
var _ = require('lodash');

module.exports = function setupRoute(router) {
    "use strict";
    /* GET home page. */

    router.get('/:server/:projectPrefix?', function(req, res) {
        var server = req.params.server;
        var projectPrefix = req.params.projectPrefix;
        buildTypesClient.getAll(server, projectPrefix, function (buildTypes) {
            var buildTypeIds = _.map(buildTypes, function (buildType) { return buildType.id });
            buildsClient.getFailed(server, buildTypeIds, function (failedBuilds) {

                var failedBuildTypes = [];
                var sortedFailedBuilds = _(failedBuilds)
                    .sortBy(function (failedBuild) {
                        return failedBuild.id;
                    })
                    .reverse()
                    .value();

                _.forEach(sortedFailedBuilds, function (failedBuild) {
                    var failedBuildType = _.find(buildTypes, function (buildType) {
                       return buildType.id == failedBuild.buildTypeId
                    });
                    failedBuildType.latestBuild = failedBuild;
                    failedBuildTypes.push(failedBuildType);
                });

                debug('Total build types found: ' + buildTypes.length);

                res.render('builds', {
                    title: 'Express',
                    server: server,
                    projectPrefix: projectPrefix,
                    builds: failedBuildTypes,
                    updated: new Date().getTime()
                });

            })
        });
    });
};
