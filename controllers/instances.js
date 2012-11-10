var app;
var instances = {
    init: function(application) {
        app = application;
        return this;
    },

    index: function(req, res) {
        res.render('instances/index', {instances: app.instances});
    },

    show: function(req, res) {
        if(!req.param('id') || !app.instances[req.param('id')]) res.status(404).end();
        var instance = app.instances[req.param('id')];

        app.io.of('/instance/' + instance.id)
        .on('connection', function (socket) {
            instance.addPlayer(socket.id);
        });

        res.render('instances/show', {title: "Welcome to game " + instance});
    }
};
module.exports = instances;