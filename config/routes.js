exports.init = function(app) {
    app.get('/', function(req,res) {
        res.render('index', {title: "challenger.io"});
    });

    var instances = require('../controllers/instances').init(app);
    app.get('/instance', instances.index);
    app.get('/instance/:id', instances.show);
}