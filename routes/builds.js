var uuid = require('node-uuid');
var debug = require('debug')('/builds');
var buildTypesClient = require('../lib/buildTypesClient');
var buildsClient = require('../lib/buildsClient');
var investigationsClient = require('../lib/investigations');
var _ = require('lodash');

module.exports = function setupRoute(router) {
  "use strict";
  /* GET home page. */

  router.get('/:server/:projectPrefix?', function (req, res) {
    var server = req.params.server;
    var projectPrefix = req.params.projectPrefix;
    var projectDisplayNameToStrip = req.query.projectDisplayNameToStrip;
    var successView = req.query.successView;

    investigationsClient.get(server, projectPrefix, function(err, investigations) {
      if (err) {
        debug('Error loading investigations', err);
        investigations = {};
      }
      buildTypesClient.getAll(server, projectPrefix, function (buildTypes) {
        var buildTypeIds = _.map(buildTypes, function (buildType) {
          return buildType.id
        });
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
              return buildType.id === failedBuild.buildTypeId
            });
            failedBuildType.latestBuild = failedBuild;
            if (investigations[failedBuildType.id]) {
              failedBuildType.assignee = investigations[failedBuildType.id];
            }

            if (projectDisplayNameToStrip != '') {
               failedBuildType.projectName = failedBuildType.projectName.replace(projectDisplayNameToStrip + ' :: ', '');
            }

            debug(failedBuildType.assignee);
            failedBuildTypes.push(failedBuildType);
          });

          debug('Failed builds: ' + buildTypes.length);
          debug('Total investigations: ' + investigations.length);

          var buildStatus = {
            title: 'TeamCity Radiator',
            server: server,
            projectPrefix: projectPrefix,
            updated: new Date()
          };
          if (sortedFailedBuilds.length > 0) {
            buildStatus.builds = failedBuildTypes;
            res.render('builds', buildStatus);
          } else {
            buildStatus.random = uuid.v4();
            if (successView === 'thumbs') {
              res.render('thumbs', buildStatus);
            } else {
              res.render('cats', buildStatus);
            }
          }
        })
      });
    });
  });
};
