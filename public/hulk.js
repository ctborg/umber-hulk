(function(){
	paper.install(window);
	function hex(path,x,y){
		var bh = new Path.RegularPolygon([x,y], 6, 56);
		bh.fillColor = '333';
		var h = new Path.RegularPolygon([x,y], 6, 50);
		h.fillColor = '000';
	}
	function tile(x,y){
		var path = new Path();
		for (var i = 0; i < 6; i++){
			for (var j = 0; j < 6; j++){
				var dx = (j % 2) ? 0 : 50;
				hex(path, i * 100 + x + dx, j * 85 + y);			}
		}
	}
	var canvas = $('#canvas')[0];
	paper.setup(canvas);
	tile(0,0);
	paper.view.draw();
})();
