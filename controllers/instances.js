var config = require('../config/application');
var Instance = require('../models/instance');
var app;
var instances = {

    init: function(application) {
        app = application;
        return this;
    },

    index: function(req, res) {
        if(!req.param('name') && req.param('submit')) var error = "You must enter a name to join!"
        if(req.param('name') && req.param('submit')) res.redirect('/instance/' + req.param('instance') + '?name=' + req.param('name'))

        var instances = [];
        var totalPlayers = 0;

        for(var i = 0, len = Object.keys(app.instances).length; i < len; i++) {
            var instance = app.instances[Object.keys(app.instances)[i]];
            instances.push({
                id: instance.id,
                score: instance.kills,
                players: Object.keys(instance.players).length
            });
            totalPlayers += Object.keys(instance.players).length;
        }

        if(totalPlayers / Object.keys(app.instances).length > config.instance.playerLimit / 2) {
            var instance = new Instance('challenger-' + Math.round(new Date().getTime()/1000.0));
            app.instances[instance.id] = instance;
        }

        res.render('instances/index', {players: totalPlayers, instances: instances, flash: error});
    },

    show: function(req, res) {
        if(!req.param('id') || !app.instances[req.param('id')]) res.status(404).end();
        var instance = app.instances[req.param('id')];
        res.render('instances/show', {
            title: "Welcome to game " + instance.id,
            name: req.param('name')
        });
    },
};

module.exports = instances;