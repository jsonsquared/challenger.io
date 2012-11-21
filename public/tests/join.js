$(function() {


	test('not join a game without a valid name', function() {
        $('#name').val('')
        $('#join-button').click()        
        equal( $('#name.error').length, 1, "field should gain a 2px red border" );        
    });


    test('join a game when entering a valid name', function() {
        $('#name').val('qunit')
        $('#join-button').click()
        equal( $('#game-container:visible').length, 1, "play screen is visible" );
        equal( $('#join-container:visible').length, 0, "join screen is hidden" );
    });

    $(document).on('startGame', function() {
    	test('a global variable called "me" should exist', function() {
    		equal( me.name, "qunit", "play screen is visible" );    		
    	})    	
    });
   
})
