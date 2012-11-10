var Player = function(id) {
    this.id = id;
    this.name = 'player';
    this.team = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;

    this.move = function(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.rotation = data.rotation || this.rotation;
    }
};
module.exports = Player;