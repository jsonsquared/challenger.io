module.exports =  [
	{
		name: 'Ammo Crate',
		color:'green',
		buff:function(p) {
			console.log('got ammo crate')
			p.clip = p.CLIP_SIZE    		
			p.refresh();
		},
		debuff:function() {}
	},
	{
		name: 'Extended Clip',
		color:'blue',
		buff:function(p) {
			p.clip = p.clipSize = Math.round(CLIP_SIZE * 1.25)
			p.refresh();
		},
		debuff:function(p) {
			p.clipSize = Math.round(p.CLIP_SIZE * 0.75)
			p.refresh()
		}
	},
	{
		name: 'Small Health Pack',
		color:'orange',
		buff:function(p) {
			p.health = Math.min(p.health + p.health * 0.15, 100)
			p.refresh()
		},
		debuff:function(){}
	},
	{
		name: 'Large Health Pack',
		color:'red',
		buff:function(p) {
			p.health = Math.min(p.health + p.health * 0.30, 100)
			p.refresh()
		},
		debuff:function(){}
	},
	{
		name: 'Sprint',
		color:'white',
		buff:function(p) {
			p.moveSpeed = MOVE_SPEED * 1.15
			p.refresh()
		},
		debuff:function(p){
			p.moveSpeed = MOVE_SPEED * 0.85
			p.refresh()
		}
	}
]	
