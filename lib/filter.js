"use strict";
var _ = require('lodash');

module.exports.byProject = function (elements, projectPrefix, getProjectId) {
  if (!projectPrefix) {
    return elements;
  }
  var projectPrefixLength = projectPrefix.length;
  var matched = _.filter(elements, function (element) {
    return getProjectId(element).substr(0, projectPrefixLength).toUpperCase() == projectPrefix.toUpperCase();
  });
  return matched;
};
