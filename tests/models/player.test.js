var Player = require('../../models/player');
var Item = require('../../models/item');
var config = require('../../config/application')

var player, foe, item, item2;

describe('Player', function() {
    beforeEach(function() {
        player = new Player('player', 10, 10);
        foe = new Player('foe', 10, 10);
    })

    it('should instantiate a new Player', function() {
        player.should.be.an.instanceOf(Player);
    })

    describe('.join()', function() {
        it('should join a game instance', function() {
            player.join('test', {id:2, data:function(){}})

            player.name.should.equal('test');
            player.instance.should.equal(2)
        })
    })

    describe('.move()', function() {
        it('should move if given an object with one key (y)', function() {
            player.move({y:10})
            player.y.should.equal(10);
        })

        it('should move if given an object with 2 keys (x and y)', function() {
            player.move({x:10,y:-10})
            player.x.should.equal(10);
            player.y.should.equal(-10);
        })

        it('should rotate and move if given an object with 3 keys (x and y rotation)', function() {
            player.move({x:10,y:-10, rotation:90})
            player.x.should.equal(10);
            player.y.should.equal(-10);
            player.rotation.should.equal(90);
        })
    })

    describe('.dash()', function() {
        it('should dash if given an object with one key', function() {
            player.dash({y:10})
            player.y.should.equal(10);
        })
    })

    describe('.useItem()', function() {

        beforeEach(function(done) {
            item = new Item({
                id:1,
                name:'test item',
                duration:100,
                buff:function(p) {
                    p.ammo = 100;
                },
                debuff:function(p) {
                    p.ammo = 50;
                }
            })
            item2 = new Item({
                id:2,
                name:'test item 2',
                duration:100,
                buff:function(p) {
                    p.health = 200;
                },
                debuff:function(p) {
                    p.health = 100;
                }
            })
            done()
        })

        it('should store the last item it picked up', function() {
            player.useItem(item);
            player.should.have.property('currentItem');
            player.currentItem.should.be.an.instanceOf(Item);
            player.currentItem.id.should.equal(1);
        })

        it('should be buffed by the items buff() method', function() {
            player.useItem(item);
            item.buff(player)
            player.ammo.should.equal(100);
        })

        it('should be debuffed when the item\'s duration has passed', function(done) {
            player.useItem(item);
            item.buff(player)
            setTimeout(function() {
                item.debuff(player)
                player.ammo.should.equal(50);
                done()
            },item.duration);
        })
    })

    describe('.takeDamage()', function() {
        beforeEach(function() {
            player.health = 100
        })

        it('should take 10 damage and not die', function() {
            var dead = player.takeDamage(10)
            player.health.should.equal(90);
            dead.should.be.false
        })

        it('should take 100 damage die', function() {
            var dead = player.takeDamage(100)
            player.health.should.equal(0);
            dead.should.be.true
        })

        it('should take more than 100 damage die', function() {
            var dead = player.takeDamage(110)
            player.health.should.equal(0);
            dead.should.be.true
        })
    })

    describe('.regenHealth()', function() {
        beforeEach(function() {
            player.health = 100

            // speed tests up
            config.instance.REGEN_INTERVAL
            config.instance.REGEN_WAIT = 50;
            config.instance.REGEN_AMOUNT = 50;

        })

        it('should take 50 damage, and begin regenerating health', function(done) {
            player.takeDamage(50)
            player.regenHealth()

            setTimeout(function() {
                player.health.should.be.above(50)
                done()
            },500)
        });

    });

    describe('.hurtByPlayer()', function() {
        beforeEach(function() {
            player.health = 100
        })

        it('should get hurt by a player and remember who it was', function() {
            player.hurtByPlayer(foe, 50)
            player.hitBy.should.an.instanceOf(Player)
            player.hitBy.id.should.equal(foe.id)
        });

    });

    describe('.hurtByItem()', function() {
        beforeEach(function() {
            player.health = 100
        })

        it('should get hurt by an item', function() {
            player.hurtByItem(item, 50)
            player.health.should.equal(50)
        });

    });

    describe('.killPlayer()', function() {
        it('should increase killCount when killing a player', function() {
            player.killedPlayer(foe)
            player.killCount.should.equal(1)
        });

        it('should increase killSpree when killing a player', function() {
            player.killedPlayer(foe)
            player.killSpree.should.equal(1)
        });
    });

    describe('.die()', function() {
        it('should add one to the players death count when dying', function() {
            player.die()
            player.deathCount.should.equal(1)
        });

        it('should know who killed them when dying', function() {
            player.die(foe);
            player.hitBy.should.be.an.instanceOf(Player)
        });

        it('should reset killSpree when dying', function() {
            player.killSpree = 2
            player.die();
            player.killSpree.should.equal(0)
        });

        it('should be flagged as dead when dying', function() {
            player.die();
            player.dead.should.be.true
        });

        it('should be teleported to x:-10000, y:-10000', function() {
            player.die();
            player.x.should.be.equal(-10000)
            player.y.should.be.equal(-10000)
        });
    });

    describe('.isEmpty()', function() {
        it('should return true if ammo is 0', function() {
            player.clip = 0;
            player.isEmpty().should.be.true
        });

        it('should return true if ammo is less than 0', function() {
            player.clip = -10;
            player.isEmpty().should.be.true
        });
    });

    describe('.respawn()', function() {
        it('should be flagged as respawning', function() {
            player.respawn(10);
            player.respawning.should.not.be.false
        });

        it('should not be flagged as respawning after respawning', function(done) {
            player.respawn(10);
            player.respawning.should.not.be.false
            setTimeout(function() {
                player.respawning.should.be.false
                done()
            },10)
        });

        it('should be moved to a random position after respawning', function(done) {
            player.x=10;
            player.respawn(10)
            setTimeout(function() {
                player.x.should.not.equal(10)
                done()
            },10)
        });

        it('should have 100% health after respawning', function(done) {
            player.health=10;
            player.respawn(10)
            setTimeout(function() {
                player.health.should.equal(100)
                done()
            },10)
        });

    });

    describe('.fire()', function() {
        it('should return true if able to fire', function() {
            player.fire().should.be.true
        });

        it('should return false if unable to fire', function() {
            player.clip = -10;
            player.fire().should.be.false
        });

        it('should use 1 round of ammunition when firing', function() {
            player.clip = 5
            player.fire()
            player.clip.should.equal(4);
        });
    });

    describe('.reloadStart(), .reloadComplete', function() {
        config.instance.RELOAD_TIME = 10;

        it('should be flagged as reloading', function() {
            player.reloadStart();
            player.reloading.should.be.true
        });

        it('should return false is already reloading', function() {
            player.reloadStart();
            player.reloadStart().should.be.false;
        });

        it('should increase ammo', function() {
            player.clip = 2
            player.reloadStart()
            setTimeout(function() {
                player.clip.should.be.above(2)
            }, config.instance.RELOAD_TIME);
        });

    })

    describe('.onKillingSpree()', function() {
        it('should return true if kills is >= 2', function() {
            player.killSpree = 2
            player.onKillingSpree().should.be.true
        });
    })


})