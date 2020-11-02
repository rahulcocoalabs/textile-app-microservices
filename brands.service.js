var server = require('./server.js'); 
var routes = ['brands'];
var serviceName = "brands";
server.start(serviceName, routes);