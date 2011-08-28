function startgame(){
	paper.install(window);
	var hexes = [];
	var HEX_RADIUS = 56;
	var HEX_APOTHEM = apothem(HEX_RADIUS); // 48
	var HEX_INNER_RADIUS = 50;
	var BORDER = 1;
	var DEGREE = Math.PI / 180;
	var offset_x = 0;
	var offset_y = 0;
	var last_update_x = 0;
	var last_update_y = 0;

	function scroll_left(dx){
		project.layers[0].translate([-dx,0]);
		offset_x -= dx;
	}

	function scroll_right(dx){
		project.layers[0].translate([dx,0]);
		offset_x += dx;
	}

	function scroll_up(dy){
		project.layers[0].translate([0,dy]);
		offset_y += dy;
	}

	function scroll_down(dy){
		project.layers[0].translate([0,-dy]);
	}

	function move_by(pt){
		project.layers[0].translate(pt);
		offset_x += pt.x;
		offset_y += pt.y;
		if (Math.abs(last_update_x - offset_x) > HEX_RADIUS ||
		    Math.abs(last_update_y - offset_y) > HEX_RADIUS){
		    last_update_x = offset_x;
		    last_update_y = offset_y;
		    var c = center_hex();
		    console.log('updating hexes centered on %d,%d', c.w, c.h);
			tile(c.w,c.h);

		}
	}

	function screen_size_in_hexes(){
		return {w: Math.ceil(window.innerWidth / ((HEX_APOTHEM + BORDER) * 2)) + 1,
		        h: Math.ceil(window.innerHeight / (HEX_RADIUS * 1.5 + BORDER)) + 1};
	}

	function offset_in_hexes(){
		return {w: Math.ceil(offset_x / ((HEX_APOTHEM + BORDER) * 2)),
		        h: Math.ceil(offset_y / (HEX_RADIUS * 1.5 + BORDER))};
	}

	function zero_center_hex(){
		var size = screen_size_in_hexes();
		return {w: Math.floor(size.w / 2), h: Math.floor(size.h / 2)};
	}

	function center_hex(){
		var c = zero_center_hex();
		var o = offset_in_hexes();
		console.log('center hex: %d,%d', c.w + o.w, c.h + o.h);
		return {w: c.w + o.w, h: c.h + o.h};
	}

	function context_hexes(){
		var size = screen_size_in_hexes();
		return Math.ceil(Math.max(size.w, size.h) / 2);
	}

	function dX(x, y){
		// convert from x,y position in array of hexes to x coordinate on canvas
		if (y % 2){
			return (x - offset_x) * (HEX_APOTHEM + BORDER) * 2;
		}else{
			return (x - offset_y) * (HEX_APOTHEM + BORDER) * 2 + HEX_APOTHEM + BORDER;
		}
	}

	function dY(y){
		return (y - offset_y) * (HEX_RADIUS * 1.5 + BORDER);
	}

	function apothem(radius){
		// only works for hexes because 6 is hardcoded
		// replace 6 with no_sides to work for all regular polygons
		return Math.round(radius * Math.cos(Math.PI / 6));
	}

	function hex(desc){
		 if (!desc) return;
		 if (desc.split){
		 	desc = JSON.parse(desc);
		 }
		 var x = desc.location[0],
		     y = desc.location[1],
		     planet_desc = desc.planet,
		     user_desc = desc.user,
		     the_hex;
		if (hexes[x] && hexes[x][y]){
			the_hex = hexes[x][y];
			//console.log('found hex for %d,%d', x,y );
		}else{
			//console.log('drawing hex for %d,%d\n%o', x, y, desc);
			var the_hex = new Group();
			if (!hexes[x]){
				hexes[x] = [];
			}
			var c_x = dX(x,y), c_y = dY(y); // convert array coords to canvas coords
			var bh = new Path.RegularPolygon([c_x, c_y], 6, HEX_RADIUS);
			bh.fillColor = '333';
			the_hex.addChild(bh);
			var h = new Path.RegularPolygon([c_x,c_y], 6, HEX_INNER_RADIUS);
			h.fillColor = '000';
			the_hex.addChild(h);
			stars(the_hex,c_x,c_y);
			hexes[x][y] = the_hex;
		}
		planet(planet_desc);
		return the_hex;
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

	function planet(desc){
		if (!desc) return;
		var x = desc.location[0],
		    y = desc.location[1],
		    cx = dX(x,y),
		    cy = dY(y),
		    name = desc.name,
		    resource = desc.resource,
		    defence = desc.defence,
		    owner = desc.owner,
		    p;
		p = new Raster($('#planet' + d(18))[0]);
		p.position = [cx,cy];
		return p;
	}
	function ship(x,y,color,owned){
			// color is blue, green, red, or plain
			var type = owned ? 'player' : '';
			color =  color || 'plain'
			var p = new Raster($('#' + type + 'ship' + color)[0]);
			p.position = [x,y];
			return p;
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
	function tile(x,y,callback){
		$.getJSON('/universe/' + x + '/' + y + '/' + context_hexes(), function(data){
			$.each(data, function(){
				 hex(this);
			});
			if(callback){
				callback();
			}
		});
	}
	function vectorShip(px, py, color1, color2, glowOn){
		color1 = color1 || '#999';
		color2 = color2 || '#ddd';
		glowOn = glowOn || false;
		var x = 0, y = 0;
		var invisibleColor = new paper.RGBColor(255, 255, 255, 0);
		var glow = new Path();
		if(glowOn = true){
			glow.fillColor = new GradientColor(new Gradient(['#ffff00', invisibleColor], 'radial'), [x, y+60], [x, y]);
			glow.add(x, y-20);
			glow.add(x+100, y+70);
			glow.add(x, y+140);
			glow.add(x-100, y+70);
			glow.add(x, y-20);
		}
		var p1 = new Path();
		p1.fillColor = new GradientColor(new Gradient([color1, color2], 'linear'), [x-10, y+85], [x-25, y+110]);
		p1.add(x-10, y+85);
		p1.add(x-15, y+90);
		p1.add(x-20, y+100);
		p1.add(x-20, y+110);
		p1.add(x-25, y+100);
		p1.add(x-23, y+90);
		p1.add(x-21, y+85);
		p1.add(x-10, y+70);
		p1.add(x-10, y+85);
		p1.smooth();
		var p2 = new Path();
		p2.fillColor = new GradientColor(new Gradient([color1, color2], 'linear'), [x+10, y+85], [x+25, y+110]);
		p2.add(x+10, y+85);
		p2.add(x+15, y+90);
		p2.add(x+20, y+100);
		p2.add(x+20, y+110);
		p2.add(x+25, y+100);
		p2.add(x+23, y+90);
		p2.add(x+21, y+85);
		p2.add(x+10, y+70);
		p2.add(x+10, y+85);
		p2.smooth();
		var body = new Path();
		body.add(x, y);
		body.add(x+10, y+20);
		body.add(x+20, y+50);
		body.add(x+20, y+70);
		body.add(x+10, y+90);
		body.add(x-10, y+90);
		body.add(x-20, y+70);
		body.add(x-20, y+50);
		body.add(x-10, y+20);
		body.add(x, y);
		body.smooth();
		body.fillColor = new GradientColor(new Gradient([color1, color2], 'linear'), [x, y], [x, y+90]);
		var p3 = new Path();
		p3.fillColor = new GradientColor(new Gradient([color1, color2], 'linear'), [x, y+80], [x, y+115]);
		p3.add(x, y+80);
		p3.add(x+3, y+95);
		p3.add(x, y+115);
		p3.add(x-3, y+ 95)
		p3.add(x, y+80);
		p3.smooth();
		var ship = new Group([glow, p1, p2, body, p3]);
		ship.scale(0.7);
		ship.position = [px, py];
		return ship;
	}

	function moveShipTo(pos){
		var ship_pos = myship.position,
			dx = ship_pos.x - pos.x,
			dy = ship_pos.y - pos.y,
			new_x, new_y;
		if (dx === 0 && dy === 0) return;
		if (Math.abs(dx) < 10){
			new_x = ship_pos.x -  dx;
		}else{
			new_x = ship_pos.x - 10 * (dx / Math.abs(dx));
		}
		if (Math.abs(dy) < 10){
			new_y = ship_pos.y -  dy;
		}else{
			new_y = ship_pos.y - 10 * (dy / Math.abs(dy));
		}
		myship.position = [new_x, new_y];
		console.log('moving towards %d,%d, now at %d,%d', pos.x, pos.y, new_x, new_y)
		setTimeout(function(){moveShipTo(pos);}, 1000/30);
	}

	var canvas = $('#canvas');
	canvas.attr({width: window.innerWidth, height: window.innerHeight});
	paper.setup(canvas[0]);
	var c = center_hex();
	tile(c.w,c.h, function(){
		window.myship = vectorShip(dX(5,4), dY(4), '#00F', '#0F0', true);
		ship(dX(9,7), dY(7), 'green');
		ship(dX(1,6), dY(6));
//		vectorShip('#963', '#369', true);
		paper.view.draw();
//		scroll_up(200);
		project.layers[0].translate([-offset_x, -offset_y]);
		view.onFrame = function(event){
			paper.view.draw();
		};
		view.onResize = function(event){
			canvas.attr({width: window.innerWidth, height: window.innerHeight});
		}
		var tool = new Tool();
		tool.onMouseDrag = function(event){
			move_by(event.delta);
		};
		tool.onMouseUp = function(event){
			try{
				moveShipTo(event.item.getPosition());
			}catch(e){
				// oh well
			}
		};
	});
	load_widgets();
};


window.onload = startgame;

//document ready
$(function() {
    $('#login_button').live( 'click', function(){
        var login_data = { 'email' : $('#login_email').val(), 'password' : $('#login_password').val() };
        $.ajax({
            url: '/login' ,
            type : 'POST',
            dataType : 'json',
            data: login_data,
            statusCode: {
                401 : function(){ alert( 'No user by that name.'); },
                403 : function(){ alert( 'Invalid login or password.'); },
                406 : function(){ alert( 'Please enter a login and password before hitting the login button.')},
                200 : function( data ){ display_user_data( data ) }
            }
        });
    });

    $('#create_user_button').live( 'click', function(){
        var login_data = { 'email' : $('#login_email').val(), 'password' : $('#login_password').val() };
        $.ajax({
            url: '/new_user' ,
            type : 'POST',
            dataType : 'json',
            data: login_data,
            statusCode: {
                401 : function(){ alert( 'No user by that name.'); },
                403 : function(){ alert( 'Invalid login or password.'); },
                406 : function(){ alert( 'Please enter a login and password before hitting the login button.')},
                200 : function( data ){ display_user_data( data ) }
            }
        });
    });

    $('#logout_button').live( 'click', function(){
        $.get('/logout');
        $('#identity').html('');
        display_login_form();
    })

});

function display_user_data( data ){
    var html = $('<button id="logout_button" class="logout">Logout</button><p>Playing as <span id="user">'+ data['name'] +'</span></p>');
    hide_login_form();
    $('#identity').append( html );
}

function display_login_form(){
    var html = '<h3>Login</h3><p><label for="login_email">Email:</label> <input name="login_email" id="login_email" /></p><p></label for="login_password">Password:</label> <input type="password" name="login_password" id="login_password" /></p><button id="login_button" class="login">Login</button><button id="create_user_button" class="login">New User</button>';
    $('#login_box').html( html );
}

function hide_login_form(){
    $('#login_box').html( '' );
}

function load_widgets(){
	var node_ko_vote_html = '<div id="node-vote"><div class="text">Think we rock?<br>Vote 4 us!</div><iframe class="vote-button" src="http://nodeknockout.com/iframe/umber-hulk" frameborder="0" scrolling="no" allowtransparency="true" width="115" height="25"></iframe></div>';
	// Vote button blocks site from loading.  Prepend after load.
	setTimeout( function(){ $('#identity').prepend( node_ko_vote_html ) }, 20 );
    
    setTimeout( function(){ $.get('/leaderboard', function( response ){
        var parsed_data = JSON.parse( response );
        var string_array = [];
        jQuery.each( parsed_data, function( key, value ){
            string_array.push('<li value="' + ( key + 1 )  +'"><span class="player you">' + value["name"]  +'</span> <span class="score">' + value["score"] +'</span></li>');
        });

        var html = $( string_array.join(' ') );
        $('#leaderboard').append( html );
    }, 25 );

    setTimeout( function(){ $.get('/myself', function( response ){
            response ? display_user_data( JSON.parse( response ) ) : display_login_form();
        });
    }, 30);
});

}

function update_user_position(){
    
    
}
