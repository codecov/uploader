/**
 * Very Insecure. Only for testing. Do not use for anything important :)
 */

 var express = require('express');
 var proxy = require('express-http-proxy');
 
 var app = express();
 
 app.use('/', proxy('codecov.io'));
 app.listen(3000);