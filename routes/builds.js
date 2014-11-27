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

                if(sortedFailedBuilds.length > 0)
               {

                    res.render('builds', {
                        title: 'Express',
                        server: server,
                        projectPrefix: projectPrefix,
                        builds: failedBuildTypes,
                        updated: new Date()
                        // updated: new Date().getTime()
                    });
                }
                else
                {
                    var arrayOfAnimals = ["http://www.weirdhut.com/wp-content/uploads/2013/07/angry-cat-3.jpg", "http://img2.wikia.nocookie.net/__cb20121008044759/thehungergames/images/4/48/Happy_cat.jpg"]

                      res.render('cats', {
                        title: 'Express',
                        server: server,
                        catImageUrl: arrayOfAnimals[Math.floor(Math.random()*arrayOfAnimals.length)],
                        updated: new Date()
                        // updated: new Date().getTime()
                    });
                }

            })
        });
    });
};
