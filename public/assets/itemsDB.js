module.exports =  [
    {
        name: 'Ammo Crate',
        color:'green',
        buff:function(p) {
            console.log('got ammo crate')
            p.clip = p.clipSize
            p.buff();
        },
        debuff:function(p) {
            p.debuff()
        }
    },
    {
        name: 'Extended Clip',
        color:'blue',
        duration:5000,
        expires:10000,
        buff:function(p) {
            p.clip = p.clipSize = Math.round(CLIP_SIZE * 1.25)
            p.buff();
        },
        debuff:function(p) {
            console.log('debuff extended clip')
            p.clipSize = CLIP_SIZE
            p.debuff()
        }
    },
    {
        name: 'Small Health Pack',
        color:'orange',
        buff:function(p) {
            p.health = Math.min(p.health+25,100)
            p.buff()
        },
        debuff:function(){}
    },
    {
        name: 'Large Health Pack',
        color:'purple',
        buff:function(p) {
            p.health = Math.min(p.health+50,100)
            p.debuff()
        },
        debuff:function(){}
    },
    {
        name: 'Sprint',
        color:'white',
        buff:function(p) {
            p.moveDistance = MOVE_DISTANCE * 1.15
            p.buff()
        },
        debuff:function(p){
            p.moveDistance = MOVE_DISTANCE
            p.debuff()
        }
    },
    {
        name: 'Bomb',
        color:'red',
        buff:function(p) {
            p.hurtByItem(this, 10)
            p.buff()
        },
        debuff:function(p){
            p.debuff()
        }
    }
]
