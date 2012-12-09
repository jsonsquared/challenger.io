module.exports =  [
    {
        name: 'Ammo Crate',
        color:'green',
        buff:function(p) {
            console.log('got ammo crate')
            p.clip = p.clipSize
        }
    },
    {
        name: 'Extended Clip',
        color:'blue',
        duration:5000,
        expires:10000,
        buff:function(p) {
            p.clip = p.clipSize = Math.round(CLIP_SIZE * 1.25)
        },
        debuff:function(p) {
            p.clipSize = CLIP_SIZE
        }
    },
    {
        name: 'Small Health Pack',
        color:'orange',
        buff:function(p) {
            p.health = Math.min(p.health+25,100)
        }
    },
    {
        name: 'Large Health Pack',
        color:'purple',
        buff:function(p) {
            p.health = Math.min(p.health+50,100)
        }
    },
    // {
    //     name: 'Sprint',
    //     color:'white',
    //     buff:function(p) {
    //         p.moveDistance = MOVE_DISTANCE * 2
    //     },
    //     debuff:function(p){
    //         p.moveDistance = MOVE_DISTANCE
    //     }
    // },
    {
        name: 'Bomb',
        color:'red',
        buff:function(p) {
            p.hurtByItem(this, 10)
        }
    }
]
