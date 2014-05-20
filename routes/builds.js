var debug = require('debug')('/builds');
var buildTypes = require('../lib/buildTypes');
var builds = require('../lib/builds');

module.exports = function setupRoute(router) {
    "use strict";
    /* GET home page. */

    router.get('/:server/:projectPrefix?', function(req, res) {
        var server = req.params.server;
        var projectPrefix = req.params.projectPrefix;
        buildTypes.getAll(server, projectPrefix, function (buildTypes) {
            builds.getFailed(server, buildTypes, function (failedBuilds) {
                res.render('builds', {
                    title: 'Express',
                    server: server,
                    projectPrefix: projectPrefix,
                    builds: failedBuilds,
                    updated: new Date()
                });
            })
        });
    });
};
