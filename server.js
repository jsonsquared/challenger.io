var config = require('./config/application');
var http = require('http');
var path = require('path');
var express = require('express')
global.app = express();

global.TILE_SIZE = 16;
global.MIN_DAMAGE = 8;
global.MAX_DAMAGE = 14;
global.REGEN_WAIT = 500;
global.TOTAL_HEALTH = 100;
global.CLIP_SIZE = 32
global.MOVE_SPEED = 200;
global.MOVE_DISTANCE = 3;
global.RESPAWN_TIME = 3000;
global.RELOAD_TIME = 1000;
global.WAIT_TIME = 5000;
global.KILL_TOTAL = 2;
global.REGEN_AMOUNT = 2;
global.REGEN_WAIT = 2000;
global.REGEN_INTERVAL = 100;

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

var instance = new Instance('challenger-io');
// instance.attachPacketHandlers(app.io)
app.instances[instance.id] = instance;

var routes = require('./config/routes');
routes.init(app);