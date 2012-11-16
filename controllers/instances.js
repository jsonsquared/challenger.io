var config = require('../config/application');
var game = require('../config/game.config');

var Instance = require('../models/instance');
var app;

var instances = {

    init: function(application) {
        app = application;
        return this;
    },

    index: function(req, res) {
        var instances = [];
        var totalPlayers = 0;

        for(var i = 0, len = Object.keys(app.instances).length; i < len; i++) {
            var instance = app.instances[Object.keys(app.instances)[i]];

            instances.push({
                id: instance.id,
                score: instance.kills,
                totalPlayers: Object.keys(instance.players).length,
                players:instance.playerList(),
                full: instance.full()
            });
            totalPlayers += Object.keys(instance.players).length;
        }

        if(totalPlayers / Object.keys(app.instances).length > game.instance.player_limit / 2) {
            var instance = new Instance('challenger-' + Math.round(new Date().getTime()/1000.0));
            instance.attachPacketHandlers(app.io);
            app.instances[instance.id] = instance;
            instances.push({
                id: instance.id,
                score: instance.kills,
                totalPlayers: Object.keys(instance.players).length,
                players:instance.playerList(),
                full: instance.full()
            });
        }

        res.render('instances/index', {
            totalPlayers: totalPlayers,
            instances: instances,
            error: req.param('error')
        });
    },

    show: function(req, res) {
        if(!req.param('id') || !app.instances[req.param('id')]) res.redirect('/instance');
        var instance = app.instances[req.param('id')];
        if(!instance || instance.full()) {
            res.redirect('/instance' + '?error=Server is full, please pick another');
        }

        res.render('instances/show', {
            instance:instance.id
        });
    }
};

module.exports = instances;