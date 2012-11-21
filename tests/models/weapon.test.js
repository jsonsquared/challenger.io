var Weapon = require('../../models/weapon');
var weapon;

describe('Weapon', function() {
    beforeEach(function() {
        weapon = new Weapon('pew', 10, 10);
    })

    it('should instantiate a new Weapon', function() {
        weapon.should.be.an.instanceOf(Weapon);
    })

    it('should have a default firerate of 1', function() {
        weapon.firerate.should.be.equal(1);
    })

    it('should have a default variation of 1', function() {
        weapon.variation.should.be.equal(1);
    })

    it('should have a default reloadTime of 1500', function() {
        weapon.reloadTime.should.equal(1500);
    })

    describe('.fire()', function() {
        it('should decrement the clipsize by firerate', function() {
            weapon.fire();
            weapon.clip.should.equal(9);
        })

        it('should return the damage', function() {
            var damage = weapon.fire();
            damage.should.equal(10)
        })

        it('should return -1 if the clip is Empty', function() {
            weapon.clip = 0;
            weapon.fire().should.equal(-1);
        })
    })

    describe('.isEmpty()', function() {
        it('should return true if the clip is empty', function() {
            weapon.clip = 0;
            weapon.isEmpty().should.be.true;
        })

        it('should return false if the clip is greater than 0', function() {
            weapon.clip = 5;
            weapon.isEmpty().should.be.false;
        })
    })

    describe('.reload()', function() {
        before(function(done) {
            weapon.reloadTime = 1;
            weapon.reload(done);
        })

        it('should reset the clip back to clipsize', function() {
            weapon.clip.should.equal(10);
        })
    })

    describe('.damage()', function() {
        describe('weapon.vary is true', function() {
            before(function() {
                weapon.vary = true;
                weapon.variation = .20;
            })

            it('should return a random damage with deviation of variation', function() {
                weapon.damage().should.be.within(8, 12)
            })
        })

        describe('weapon.vary is false', function() {
            it('should return the exact damage', function() {
                weapon.damage().should.equal(10);
            })
        })
    })
})