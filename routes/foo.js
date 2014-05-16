module.exports = function setupRoutes(router) {
    "use strict";
    router.get('/foobarbaz', function (req, res) {
       res.status(200).send('<h1>Hello World</h1>');
    });
};