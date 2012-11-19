function CollisionManager(owner, hitArea) {
    this.owner = owner
    this.items = [];

    this.add = function(what) {
        this.items.push(what)
    }

    this.remove = function(from) {
        var rest = this.slice(from + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    }

    this.check = function() {
        for(var i=0;i<this.items.length;i++) {
            if (owner.y + hitArea< this.items[i].y)  continue
            if (owner.y > this.items[i].y + hitArea) continue
            if (owner.x + hitArea < this.items[i].x) continue
            if (owner.x > this.items[i].x + hitArea) continue
            this.items[i].onCollision()
        }
    }
}