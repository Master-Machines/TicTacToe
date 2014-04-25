var gameBoard;
$(function() {
	gameBoard = new GameBoard();
})



function GameBoard() {
	this.cells = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
	this.clickHandler = new Array(3);
	this.numPlayers = 0;
	this.playing = true;
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
	for(var i = 0; i < this.clickHandler.length; i++) {
		this.clickHandler[i] = new Array(3);
	}
	
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
			var yPos = this.height * (((i + 1) * .3) - .1);
			this.createCell(xPos, yPos, g, i);
		}
	}
}

GameBoard.prototype.createCell = function(x, y, cellArrayX, cellArrayY) {
	var ThisGameBoard = this;
	this.clickHandler[cellArrayX][cellArrayY] = this.paper.circle(parseInt(x), parseInt(y), parseInt(this.width * .028 + this.height * .03)).attr({"stroke-width" : "0", "fill" : "#CCC", "cursor" : "pointer"}).mousedown(function() {
		ThisGameBoard.fillElement(ThisGameBoard.turn, cellArrayX, cellArrayY);
		this.remove();
	});
}

GameBoard.prototype.aiMakeMove = function() {
	var ThisGameBoard = this;
	var cellArrayX;
	var cellArrayY;
	
	do {
		cellArrayX = Math.floor(Math.random() * 3);
		cellArrayY = Math.floor(Math.random() * 3);
	} while (this.cells[cellArrayX][cellArrayY] != -1);
	
	ThisGameBoard.fillElement(ThisGameBoard.turn, cellArrayX, cellArrayY);
	this.clickHandler[cellArrayX][cellArrayY].remove();
}

GameBoard.prototype.fillElement = function(turn, x, y) {
	this.cells[x][y] = turn;
	var xPos =  this.width * (((x + 1) * .3) - .1);
	var yPos = this.height * (((y + 1) * .3) - .1);
	if(turn == 0) {
		this.drawCross(xPos, yPos);
		if (this.didWin(turn))
			this.endGame('X');
	} else {
		this.drawCircle(xPos, yPos);
		if (this.didWin(turn))
			this.endGame('O');
	}
	this.turn ++;
	if(this.turn == 2) this.turn = 0;
	if(this.turn == 1 && this.playing) this.aiMakeMove();
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

GameBoard.prototype.didWin = function(turn) {	
	// Check top left
	if (this.cells[0][0] == turn) {
		// Check top row
		if (this.cells[0][1] == turn && this.cells[0][2] == turn)
			return true;
		// Check left column
		if (this.cells[1][0] == turn && this.cells[2][0] == turn)
			return true;
		// Check top left to bot right diagonal
		if (this.cells[1][1] == turn && this.cells[2][2] == turn)
			return true;
	}
	
	// Check top center
	if (this.cells[0][1] == turn) {
		// Check center column
		if (this.cells[1][1] == turn && this.cells[2][1] == turn)
			return true;
	}
	
	// Check top right
	if (this.cells[0][2] == turn) {
		// Check right column
		if (this.cells[1][2] == turn && this.cells[2][2] == turn)
			return true;
		// Check top right to bot left diagonal
		if (this.cells[1][1] == turn && this.cells[2][0] == turn)
			return true;
	}
	
	// Check center left
	if (this.cells[1][0] == turn) {
		// Check center row
		if (this.cells[1][1] == turn && this.cells[1][2] == turn)
			return true;
	}
	
	// Check bot left
	if (this.cells[2][0] == turn) {
		// Check bot row
		if (this.cells[2][1] == turn && this.cells[2][2] == turn)
			return true;
	}
	
	// No win
	return false;
}

GameBoard.prototype.endGame = function(shape) {
	console.debug("Player ", shape, " Wins!");
	this.playing = false;
}