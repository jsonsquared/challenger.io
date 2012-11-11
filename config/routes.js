exports.init = function(app) {
    app.get('/', function(req,res) { res.redirect('/instance'); });

    var instances = require('../controllers/instances').init(app);
    app.get('/', instances.index);
    app.get('/instance', instances.index);
    app.post('/instance', instances.index);
    app.get('/instance/:id', instances.show);
}