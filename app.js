var gameBoard;
$(function() {
	gameBoard = new GameBoard();
})



function GameBoard() {
	$("#loading").remove();
	this.cells = [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]];
	this.clickHandler = new Array(3);
	this.numPlayers = 0;
	this.playing = true;
	this.turn = 0;
	this.paper = null;
	this.width = $(document).width();
	this.height = $(document).height();
	this.lineWidth = this.height * .015 + this.width * .015;
	this.gameMoves = "";
	this.circles = [];
	this.crosses = [];
	this.cellSpaces = [];
	this.drawBoard();
	//this.dumbAIMakeMove();
}

GameBoard.prototype.drawBoard = function() {
	for(var i = 0; i < this.clickHandler.length; i++) {
		this.clickHandler[i] = new Array(3);
	}
	
	this.gameMoves = "";
	
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

GameBoard.prototype.stringStartsWith = function(element, str) {
	console.debug("e ", element);
	console.debug("s ", str);
	return element.slice(0, str.length) == str;
}

GameBoard.prototype.smartAIMakeMove = function() {
	var ThisGameBoard = this;
	var cellArrayX;
	var cellArrayY;
	
	//var possibleGames = [];
	//var nextMove = wins[this.gameMoves];
	
	if (this.gameMoves.length == 1) {
		if (this.checkEdgeCenter() || this.checkCorner()) {
			cellArrayX = 1;
			cellArrayY = 1;
		} else {
			cellArrayX = 0;
			cellArrayY = 0;
		}
	} else if (this.gameMoves.length == 3 && ((this.cells[0][0] == 0 && this.cells[2][2]) == 0 || (this.cells[0][2] == 0 && this.cells[2][0] == 0))) {
		if (this.cells[1][1] == 0) {
			cellArrayX = 0;
			cellArrayY = 2;
		} else {
			cellArrayX = 1;
			cellArrayY = 2;
		}
	} else {
		var nextMove = this.checkNextMove(1);

		if (nextMove != false) {
			cellArrayX = nextMove[0];
			cellArrayY = nextMove[1];
		} else {
			nextMove = this.checkNextMove(0);
			if (nextMove != false) {
				cellArrayX = nextMove[0];
				cellArrayY = nextMove[1];
			} else {
				do {
					cellArrayX = Math.floor(Math.random() * 3);
					cellArrayY = Math.floor(Math.random() * 3);
				} while (this.cells[cellArrayX][cellArrayY] != -1);
			}
		}
	}
	
	ThisGameBoard.fillElement(ThisGameBoard.turn, cellArrayX, cellArrayY);
	this.clickHandler[cellArrayX][cellArrayY].remove();
}

GameBoard.prototype.checkNextMove = function(turn) {
	// Check rows and cols
	for (var i = 0; i < 3; i++) {
		// Rows
		if (this.cells[i][0] == turn && this.cells[i][1] == turn && this.cells[i][2] == -1)
			return [i,2];
		if (this.cells[i][0] == turn && this.cells[i][2] == turn && this.cells[i][1] == -1)
			return [i,1];
		if (this.cells[i][1] == turn && this.cells[i][2] == turn && this.cells[i][0] == -1)
			return[i,0]
			
		// Cols
		if (this.cells[0][i] == turn && this.cells[1][i] == turn && this.cells[2][i] == -1)
			return [2,i];
		if (this.cells[0][i] == turn && this.cells[2][i] == turn && this.cells[1][i] == -1)
			return [1,i];
		if (this.cells[1][i] == turn && this.cells[2][i] == turn && this.cells[0][i] == -1)
			return [0,i];
	}
	
	if (this.cells[0][0] == turn && this.cells[1][1] == turn && this.cells[2][2] == -1)
		return [2,2];
	if (this.cells[0][0] == turn && this.cells[2][2] == turn && this.cells[1][1] == -1)
		return [1,1];
	if (this.cells[1][1] == turn && this.cells[2][2] == turn && this.cells[0][0] == -1)
		return [0,0];
		
	if (this.cells[0][2] == turn && this.cells[1][1] == turn && this.cells[2][0] == -1)
		return [2,0];
	if (this.cells[0][2] == turn && this.cells[2][0] == turn && this.cells[1][1] == -1)
		return [1,1];
	if (this.cells[1][1] == turn && this.cells[2][0] == turn && this.cells[0][2] == -1)
		return [0,2];
		
	return false;
}

GameBoard.prototype.checkEdgeCenter = function() {
	return (this.cells[0][1] != -1 || this.cells[2][1] != -1 || this.cells[1][0] != -1 || this.cells[1][2] != -1);
}

GameBoard.prototype.checkCorner = function() {
	return (this.cells[0][0] != -1 || this.cells[0][2] != -1 || this.cells[2][0] != -1 || this.cells[2][2] != -1);
}

GameBoard.prototype.dumbAIMakeMove = function() {
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
	
	this.gameMoves += y * 3 + x;
	
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
	if(this.turn == 2 && this.playing)
	{ 
		this.turn = 0;
		//this.dumbAIMakeMove()
	}
	var superThis = this;
	if(this.turn == 1 && this.playing) setTimeout(function(){
		superThis.smartAIMakeMove();
	}, 500);
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
		// Check left column
		if (this.cells[0][1] == turn && this.cells[0][2] == turn) {
			this.drawWinLine(0,0,0,2);
			return true;
		}
		// Check top row
		if (this.cells[1][0] == turn && this.cells[2][0] == turn) {
			this.drawWinLine(0,0,2,0);
			return true;
		}
		// Check top left to bot right diagonal
		if (this.cells[1][1] == turn && this.cells[2][2] == turn) {
			this.drawWinLine(0,0,2,2);
			return true;
		}
	}
	
	// Check middle left
	if (this.cells[0][1] == turn) {
		// Check row
		if (this.cells[1][1] == turn && this.cells[2][1] == turn) {
			this.drawWinLine(0,1,2,1);
			return true;
		}
	}
	
	// Check bottom left
	if (this.cells[0][2] == turn) {
		// Check bottom row
		if (this.cells[1][2] == turn && this.cells[2][2] == turn) {
			this.drawWinLine(0,2,2,2);
			return true;
		}
		// Check bottom left to top right diagonal
		if (this.cells[1][1] == turn && this.cells[2][0] == turn) {
			this.drawWinLine(0,2,2,0);
			return true;
		}
	}
	
	// Check top middle
	if (this.cells[1][0] == turn) {
		// Check middle column
		if (this.cells[1][1] == turn && this.cells[1][2] == turn) {
			this.drawWinLine(1,0,1,2);
			return true;
		}
	}
	
	// Check top right
	if (this.cells[2][0] == turn) {
		// Check right column
		if (this.cells[2][1] == turn && this.cells[2][2] == turn) {
			this.drawWinLine(2,0,2,2);
			return true;
		}
	}
	
	this.checkTie();
	
	// No win
	return false;
}

GameBoard.prototype.drawWinLine = function(startX, startY, endX, endY) {
	var radi = this.width * .015 + this.height * .015;
	var xPos1 =  this.width * (((startX + 1) * .3) - .1);
	var yPos1 = this.height * (((startY + 1) * .3) - .1);
	var xPos2 =  this.width * (((endX + 1) * .3) - .1);
	var yPos2 = this.height * (((endY + 1) * .3) - .1);
	this.paper.path("M" + xPos1 + "," + yPos1 + "L" + xPos2 + "," + yPos2).attr({"stroke" : "#0A0", "stroke-width" : radi});
}

GameBoard.prototype.checkTie = function() {
	var count = 0
	
	for(i = 0; i < 3; i++) {
		for(j = 0; j < 3; j++) {
			if (this.cells[i][j] != -1) {
				count++;
			}
		}
	}
	if (count == 9)
	{
		console.debug("Tie");
		this.playing = false;
	}
}

GameBoard.prototype.endGame = function(shape) {
	console.debug("Player ", shape, " Wins!");
	this.playing = false;
}