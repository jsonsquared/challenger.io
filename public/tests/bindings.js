$(function() {
    $(document).on('startGame', function() {


        module('shooting and reloading')
        socket.on('fired', function(data) {      
            test('recieve a response from the server that I shot', function() {
                equal(data.owner, me.id, 'heard my own shot')
            })


            socket.on('reloaded', function(data) { 
                test('reload when pressing R', function() {
                    ok(true)
                })
            })
            holdKey(82, 200)

        })
        holdKey(32, 500)   

 
        setTimeout(function() {
            module('chat')        
            test('send and recieve chat', function() {
                holdKey(13, 100, function() {
                
                    test('pressing enter should focus chat', function() {
                        equal($('#chat-input:focus').length, 1)                    
                    })

                    $('#chat-input').val('test message');

                    holdKey(13, 100,function() {
                        test('pressing enter again should remove focus from chat', function() {
                            equal($('#chat-input:focus').length, 0)                    
                        })

                        test('my message sould appear in chat', function() {
                            equal($('#chat li:contains(": test message")').length, 1)                      
                        })
                    })
                })
                equal($('#chat-input:focus').length, 1)
            })
        },1000)

        setTimeout(function() {
            module('WASD movement')
            disableWalls();

            var origX = me.x;
            var origY = me.y;
            holdKey(87,200, function() {
                test('move up when holding W', function() {   
                    ok(me.y < origY)
                })
            })

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(68,200, function() {
                    test('move right when holding D', function() {   
                        ok(me.x > origX)        
                    })              
                })
            },200)

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(83,200, function() {
                    test('move down when holding S', function() {   
                        ok(me.y > origY)        
                    })              
                })
            },400)          

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(65,200, function() {
                    test('move left when holding A', function() {   
                        ok(me.x < origX)        
                    })              
                })
            },600)      
        },2000)


          
        setTimeout(function() {

            module('arrow key movement')
            disableWalls();            

            var origX = me.x;
            var origY = me.y;
            holdKey(38,200, function() {
                test('move up when holding UP', function() {   
                    ok(me.y < origY)
                })
            })

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(39,200, function() {
                    test('move right when holding RIGHT', function() {   
                        ok(me.x > origX)        
                    })              
                })
            },200)

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(40,200, function() {
                    test('move down when holding DOWN', function() {   
                        ok(me.y > origY)        
                    })              
                })
            },400)          

            setTimeout(function() {
                var origX = me.x;
                var origY = me.y;
                holdKey(37,200, function() {
                    test('move left when holding LEFT', function() {   
                        ok(me.x < origX)        
                    })              
                })
            },600)   
        },3000)
    })

    joinGame()
})