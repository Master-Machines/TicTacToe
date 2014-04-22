var gameBoard;
$(function() {
	gameBoard = new GameBoard();
})



function GameBoard() {
	this.cells = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
	this.turn = 0;
	this.paper = null;
	this.width = $(document).width();
	this.height = $(document).height();
	this.lineWidth = this.height * .015 + this.width * .015;
	this.circles = [];
	this.crosses = [];
	this.cellSpaces = [];
	this.drawBoard();
}

GameBoard.prototype.drawBoard = function() {
	this.paper = Raphael(0, 0, this.width, this.height);
	this.lines = [];
	this.lines.push(this.paper.rect(this.width * .333 - this.lineWidth/2, 0, this.lineWidth, this.height));
	this.lines.push(this.paper.rect(this.width * .666 - this.lineWidth/2, 0, this.lineWidth, this.height));
	this.lines.push(this.paper.rect(0, this.height * .333 - this.lineWidth/2, this.width, this.lineWidth));
	this.lines.push(this.paper.rect(0, this.height * .666 - this.lineWidth/2, this.width, this.lineWidth));
	this.lines.forEach(function(line) {
		line.attr({fill : "#333", "stroke-width" : "0"});
	});
	this.createCells();
	// this.fillElement(1,0,0);
	// this.fillElement(0,1,0);
	// this.fillElement(1,2,0);
	// this.fillElement(0,0,1);
	// this.fillElement(1,1,1);
	// this.fillElement(0,2,1);
	// this.fillElement(1,0,2);
	// this.fillElement(0,1,2);
	// this.fillElement(1,2,2);
}

GameBoard.prototype.createCells = function() {
	for(var i = 0; i < 3; i++) {
		for(var g = 0; g < 3; g++) {
			var xPos =  this.width * (((g + 1) * .3) - .1);
			var yPos = this.height * (((i + 1)  * .3) - .1);
			this.createCell(xPos, yPos, g, i);
		}
	}
}

GameBoard.prototype.createCell = function(x, y, cellArrayX, cellArrayY) {
	var ThisGameBoard = this;
	var cell = this.paper.circle(parseInt(x), parseInt(y), parseInt(this.width * .028 + this.height * .03)).attr({"stroke-width" : "0", "fill" : "#CCC", "cursor" : "pointer"}).mousedown(function() {
		ThisGameBoard.fillElement(ThisGameBoard.turn, cellArrayX, cellArrayY);
		this.remove();
	});
}

GameBoard.prototype.fillElement = function(turn, x, y) {
	this.cells[x][y] = turn;
	var xPos =  this.width * (((x + 1) * .3) - .1);
	var yPos = this.height * (((y + 1)  * .3) - .1);
	if(turn == 0) {
		this.drawCross(xPos, yPos);
	} else {
		this.drawCircle(xPos, yPos);
	}
	this.turn ++;
	if(this.turn == 2) this.turn = 0;
}

GameBoard.prototype.drawCircle = function(x,y) {
	this.circles.push(this.paper.circle(x, y, this.width * .03 + this.height * .03).attr({"stroke-width" : parseInt(this.width * .005 + this.height * .01), "stroke" : "#000"}));
}

GameBoard.prototype.drawCross = function(x,y) {
	var radi = this.width * .01 + this.height * .01;
	var pathString = "M" + (x - 2 * radi) + "," + (y + 2 * radi) + "L" + (x + 2 * radi) + "," + (y - 2 * radi);
	var pathString2 = "M" + (x - 2 * radi) + "," + (y - 2 * radi) + "L" + (x + 2 * radi) + "," + (y + 2 * radi);
	console.log(pathString);
	this.crosses.push(this.paper.path(pathString).attr({"stroke-width" : radi * .5, "stroke" : "#A00"}));
	this.crosses.push(this.paper.path(pathString2).attr({"stroke-width" : radi * .5, "stroke" : "#A00"}));
}