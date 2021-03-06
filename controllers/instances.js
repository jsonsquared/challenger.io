var config = require('../config/application');
var Instance = require('../models/instance');
var app;
var instances = {

    init: function(application) {
        app = application;
        return this;
    },

    test:function(req, res) {
        res.render('instances/test')
    },

    scrolling:function(req, res) {
        res.render('instances/scrolling')
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

        if(totalPlayers / Object.keys(app.instances).length > config.instance.player_limit / 2) {
            var instance = new Instance({id:'challenger-' + Math.round(new Date().getTime()/1000.0)});
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

        console.log(req.query)
        res.render('instances/show', {
            instance:instance.id,
            testing:req.param('test')
        });
    }
};

module.exports = instances;