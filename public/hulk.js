function startgame(){
	paper.install(window);
	var hexes = [];
	var HEX_RADIUS = 56;
	var HEX_APOTHEM = apothem(HEX_RADIUS); // 48
	var HEX_INNER_RADIUS = 50;
	var BORDER = 2;
	var DEGREE = Math.PI / 180;
	var offset_x = 0;
	var offset_y = 0;

	function dX(x, y){
		// convert from x,y position in array of hexes to x coordinate on canvas
		if (y % 2){
			return (x - offset_x) * (HEX_APOTHEM + BORDER) * 2;
		}else{
			return (x - offset_y) * (HEX_APOTHEM + BORDER) * 2 + HEX_APOTHEM + BORDER;
		}
	}

	function dY(y){
		return (y - offset_y) * HEX_RADIUS * 1.5;
	}

	function apothem(radius){
		// only works for hexes because 6 is hardcoded
		// replace 6 with no_sides to work for all regular polygons
		return Math.round(radius * Math.cos(Math.PI / 6));
	}

	function hex(x,y){
		if (hexes[x] && hexes[x][y]){
			return hexes[x][y];
		}
		var group = new Group();
		if (!hexes[x]){
			hexes[x] = [];
		}
		var c_x = dX(x,y), c_y = dY(y); // convert array coords to canvas coords
		var bh = new Path.RegularPolygon([c_x, c_y], 6, HEX_RADIUS);
		bh.fillColor = '333';
		group.addChild(bh);
		var h = new Path.RegularPolygon([c_x,c_y], 6, HEX_INNER_RADIUS);
		h.fillColor = '000';
		group.addChild(h);
		stars(group,c_x,c_y);
		var p = planet(c_x, c_y);
		if (p){
			group.addChild(p);
		}
		hexes[x][y] = group;
		return group;
	}
	function randint(start, stop){
        // return an integer between start and stop, inclusive
    	if (stop === undefined){
        	stop = start;
        	start = 0;
    	}
    	var factor = stop - start + 1;
    	return Math.floor(Math.random() * factor) + start;
	}
	function d(no_dice, sides){
		if (sides === undefined){
			sides = no_dice;
			no_dice = 1;
		}
		var val = 0;
		for (var i = 0; i < no_dice; i++){
			val += randint(1, sides);
		}
		return val;
	}

	function stars(group,x,y){
		var i, no_stars = d(6);
		for (i = 0; i < no_stars; i++){
			group.addChild(star(x, y, Math.round(Math.cos(Math.random() * Math.PI) * 3) + 1));
		}
	}

	function planet(x, y){
		if (d(10) === 1){
			var p = new Raster($('#planet' + d(18))[0]);
			p.position = [x,y];
			p.scale(.30);
			return p;
		}
	}
	function ship(x,y,color,owned){
			// color is blue, green, red, or plain
			var type = owned ? 'player' : '';
			color =  color || 'plain'
			var p = new Raster($('#' + type + 'ship' + color)[0]);
			p.position = [x,y];
	}
	function star(x,y, magnitude){
		var cx, cy, r = d(HEX_APOTHEM), theta = d(360) * DEGREE;
		cx = Math.cos(theta) * r + x;
		cy = Math.sin(theta) * r + y;
		var s = new Path.Circle([cx,cy], 1);
		s.fillColor = 'FFF';
		s.opacity = (d(50) + 50) / 100;
		return s;
	}
	function tile(x,y){
		for (var i = 0; i < 6; i++){
			for (var j = 0; j < 6; j++){
				hex(i + x, j + y);
			}
		}
	}
	var canvas = $('#canvas');
	canvas.attr({width: window.innerWidth, height: window.innerHeight});
	paper.setup(canvas[0]);
	tile(0,0);
	tile(0,6);
	tile(0,12);
	tile(6,0);
	tile(6,6);
	tile(6,12);
	tile(12,0);
	tile(12,6);
	tile(12,12);
	var x = randint(0,5), y = randint(0,5);
	ship(dX(5,4), dY(4), 'blue', true);
	ship(dX(9,7), dY(7), 'green');
	ship(dX(1,6), dY(6));
	paper.view.draw();
};


window.onload = startgame;

//document ready
$(function() {
    $('#login_button').click( function(){
        var login_data = { 'email' : $('#login_email').val(), 'password' : $('#login_password').val() };
        $.ajax({
            url: '/login' ,
            type : 'POST', 
            data: login_data,
            statusCode: {
                401 : function(){ alert( 'No user by that name.'); },
                403 : function(){ alert( 'Invalid login or password.'); },
                406 : function(){ alert( 'Please enter a login and password before hitting the login button.')},
                200 : function(){ alert( 'login worked'); }
            }
        });
    });
    
    $('#logout_button').click( function(){
        $.get('/logout', function(){
            alert( 'Logged out' );
        } );
    })
        
});
var node_ko_vote_html = '<div id="node-vote"><div class="text">Think we rock?<br>Vote 4 us!</div><iframe class="vote-button" src="http://nodeknockout.com/iframe/umber-hulk" frameborder="0" scrolling="no" allowtransparency="true" width="115" height="25"></iframe></div>';
// Vote button blocks site from loading.  Prepend after load.
setTimeout( function(){ $('#identity').prepend( node_ko_vote_html ) }, 2000 );