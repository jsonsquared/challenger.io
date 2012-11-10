function config() {
    var env = process.env.NODE_ENV || 'development';
    return require('./env/' + env + '.config')
}
module.exports = config();