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

app.io = require('socket.io').listen(app.listen(config.port));
app.io.set('log level', 1);


var Instance = require('./models/instance')
app.instances = {};
app.instances['zomg-games-123'] = new Instance('zomg-games-123');

var routes = require('./config/routes');
routes.init(app);