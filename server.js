var config = require('./config/application');
var http = require('http');
var path = require('path');
var express = require('express')
var app = express();

app.configure(function(){
    app.set('port', config.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'hbs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var ratchet = require('ratchetio');
app.configure('production', function(){
  app.use(ratchet.errorHandler(config.ratchet_key));
});

var routes = require('./config/routes');
routes.init(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
