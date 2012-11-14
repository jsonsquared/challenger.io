var canvas = document.getElementById("canvas-lighting")

var lights = [],
blocks = [],
vector = function(_x,_y){
    this.x = _x;
    this.y = _y;  
}
light = function(_position,_radius,_angleSpread, _color){
    this.color = _color;
    this.radius = _radius;
    this.angleSpread = _angleSpread;
    this.position = _position;
    this.angle = Math.random()*180;
},
block = function(_position,_width,_height){
   this.position = _position;
   this.width = _width;
   this.height = _height;
   this.visible = false;
},
angle = 0;


function findDistance(light, block, angle, rLen, start, shortest, closestBlock){
    var y = (block.position.y + tileSize*.5) - light.position.y,
        x = (block.position.x + tileSize*.5) - light.position.x,
        dist = Math.sqrt((y * y) + (x * x));
        start = start

    if(light.radius >= dist)
    {
        var rads = angle * (Math.PI / 180),
            pointPos = new vector(light.position.x, light.position.y);
        
        pointPos.x += Math.cos(rads) * dist;
        pointPos.y += Math.sin(rads) * dist;
        
        if(pointPos.x > block.position.x && pointPos.x < block.position.x + block.width && pointPos.y > block.position.y && pointPos.y < block.position.y + block.height)
        {
            if(start || dist < shortest){
                start = false;
                shortest = dist;
                rLen= dist;
                closestBlock = block;
            }
            
            return {'start' : start, 'shortest' : shortest, 'rLen' : rLen, 'block' : closestBlock};
        }
    }
    return {'start' : start, 'shortest' : shortest, 'rLen' : rLen, 'block' : closestBlock};
}

function shineLight(light){
    
    // console.log(light)
    
    //console.log(light.angle)

    var curAngle = light.angle - (light.angleSpread/2),
        dynLen = light.radius,
        addTo = 1/light.radius;
    
    for(curAngle; curAngle < light.angle + (light.angleSpread/2); curAngle += (addTo * (180/Math.PI))*lighting_precision){
        dynLen = light.radius;
        
        var findDistRes = {};
            findDistRes.start = true;
            findDistRes.shortest = 0;
            findDistRes.rLen = dynLen,
            findDistRes.block = {};
                    
        for(var i = 0; i < blocks.length; i++)
        {
            findDistRes = findDistance(light, blocks[i], curAngle, findDistRes.rLen, findDistRes.start, findDistRes.shortest, findDistRes.block);
        }
         
        var rads = curAngle * (Math.PI / 180),
        end = new vector(light.position.x, light.position.y);
        
        findDistRes.block.visible = true;
        end.x += Math.cos(rads) * findDistRes.rLen;
        end.y += Math.sin(rads) * findDistRes.rLen;
       
        ctx.beginPath();
        ctx.moveTo(light.position.x, light.position.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();       
        ctx.stroke();
    }
}



function draw(){
  
    // canvas_lighting_ctx.fillStyle='rgba(0,0,0,1)'
    // canvas_lighting_ctx.globalCompositeOperation = 'source-over'
    // canvas_lighting_ctx.fillRect(0,0,canvas_lighting.width,canvas_lighting.height)

    // // fill the lighting canvas with the amount of "natual light"
    // canvas_lighting_ctx.fillStyle="rgba(0,0,0," + natural_light + ")";
    // canvas_lighting_ctx.globalCompositeOperation = 'destination-out'
    // canvas_lighting_ctx.fillRect(0,0,canvas_lighting.width,canvas_lighting.height)

    

    for(var i = 0; i < lights.length; i++){

        if(i==0) {
            lights[i].position.x = me.x
            lights[i].position.y = me.y
            lights[i].angle = me.rotation
        }

        // ctx.strokeStyle = lights[i].color;
        lights[i].radius += Math.sin(angle);
        shineLight(lights[i]);  
    } 

    canvas_main_ctx.drawImage(canvas_lighting, 0, 0)

}

//player
lights.push(new light(new vector(256,256), 300, 120, 'rgba(255,255,255,.1)'));

// lights.push(new light(new vector(256,256), 300, 120, 'rgba(255,255,255,.1)'));
// lights[1].position.x = 353
// lights[1].position.y = 309

// lights.push(new light(new vector(256,256), 300, 120, 'rgba(255,255,255,.1)'));
// lights[1].position.x = 674
// lights[1].position.y = 115

// lights.push(new light(new vector(256,256), 300, 120, 'rgba(255,255,255,.1)'));
// lights[1].position.x = 607
// lights[1].position.y = 422

// lights.push(new light(new vector(256,256), 300, 120, 'rgba(255,255,255,.1)'));
// lights[1].position.x = 149
// lights[1].position.y = 498



function initRayCaster() {
    for(var i = 0; i < walls.length; i++){
        var size = 16
        blocks.push(new block(new vector(walls[i].x*tileSize,walls[i].y*tileSize),size,size)); 
    }
}