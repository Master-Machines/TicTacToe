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
			this.createCell(xPos, yPos, i, g);
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
	var cellArrayX = -1;
	var cellArrayY = -1;
	
	// Check for any special cases
	var move;
	var specialCase;

	specialCase = this.checkSpecialCase("540");
	if (specialCase != false) {
		var orientedSolution = this.orientSolution(0, 2, specialCase);
		if (this.cells[orientedSolution[0]][orientedSolution[1]] == -1) {
			console.debug("Fixing solution");
			cellArrayX = orientedSolution[0];
			cellArrayY = orientedSolution[1];
		}
	}
	
	specialCase = this.checkSpecialCase("745");
	if (specialCase != false) {
		var orientedSolution = this.orientSolution(2, 2, specialCase);
		if (this.cells[orientedSolution[0]][orientedSolution[1]] == -1) {
			console.debug("Fixing solution");
			cellArrayX = orientedSolution[0];
			cellArrayY = orientedSolution[1];
		}
	}
	
	if (this.gameMoves.length == 1) {
		if ((this.checkEdgeCenter() || this.checkCorner()) && this.cells[1][1] == -1) {
			// If first move is edge or corner take center
			cellArrayX = 1;
			cellArrayY = 1;
		} else if (this.cells[0][0] == -1) {
			// Else top left
			cellArrayX = 0;
			cellArrayY = 0;
		}
	}
	if (this.gameMoves.length == 3) {
		if (((this.cells[0][0] == 0 && this.cells[2][2] == 0) || (this.cells[0][2] == 0 && this.cells[2][0] == 0)) && this.cells[1][2] == -1) {
			// If AI center with player in opposing corners force defense by player
			cellArrayX = 2;
			cellArrayY = 1;
		} else if (this.cells[1][1] == 0 && this.cells[2][2] == 0 && this.cells[0][2] == -1) {
			// If AI top left and player center and bot right, take bot left
			cellArrayX = 2;
			cellArrayY = 0;
		}
	}
	if (cellArrayX == -1 && cellArrayY == -1) {
		// Check for win
		var nextMove = this.checkNextMove(1);

		if (nextMove != false) {
			// If win exists, take it
			cellArrayX = nextMove[0];
			cellArrayY = nextMove[1];
		} else {
			// Else check for block
			nextMove = this.checkNextMove(0);
			
			if (nextMove != false) {
				// If block exists, take it
				cellArrayX = nextMove[0];
				cellArrayY = nextMove[1];
			} else {
				// Else random move
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

GameBoard.prototype.orientSolution = function(x, y, orientation) {
	switch (orientation[0]) {
		case 1:
			y = 2 - y;
			break;
		case 2:
			x = 2 - x;
			y = 2 - y;
			break;
		case 3:
			var temp = x;
			x = y;
			y = temp;
			break;
	}
	
	switch (orientation[1]) {
		case 1:
			if (x == 0) {
				x = y;
				y = 2;
			} else if (x == 1) {
				var temp = x;
				x = y;
				y = temp;
			} else if (x == 2) {
				x = y;
				y = 0;
			}
			break;
		case 2:
			if (x == 0) {
				x = 2;
				y = 2 - y;
			} else if (x == 1) {
				y = 2 - y;
			} else if (x == 2) {
				x = 0;
				y = 2 - y;
			}
			break;
		case 3:
			if (x == 0) {
				x = 2 - y;
				y = 0;
			} else if (x == 1) {
				var temp = x;
				x = 2 - y;
				y = temp;
			} else if (x == 2) {
				x = 2 - y;
				y = 2;
			}
			break;
	}
	
	return [x,y];
}

GameBoard.prototype.checkSpecialCase = function(caseMoves) {
	var caseBoard = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
	
	for (var i = 0; i < caseMoves.length; i++) {
		var move = parseInt(caseMoves.charAt(i));
		var x = Math.floor(move / 3);
		var y = Math.floor(move % 3);
		
		caseBoard[x][y] = i % 2;
	}
	
	for (var flip = 0; flip < 4; flip++) {
		var tempBoard = this.getFlippedBoard(flip, caseBoard);
		
		for (var rot = 0; rot < 4; rot++) {
			//console.debug("orientation[", flip, ",", rot, "]");
			if (rot != 0)
				tempBoard = this.getRotatedBoard(tempBoard);
				
			var isThisOrientation = true;
			
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if (tempBoard[x][y] != this.cells[x][y])
						isThisOrientation = false;
				}
			}
			
			if (isThisOrientation)
				return [flip, rot];
		}
	}
	
	return false;
}

GameBoard.prototype.getRotatedBoard = function(array) {
	var rotated90 = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
	rotated90[0][0] = array[2][0];
	rotated90[0][1] = array[1][0];
	rotated90[0][2] = array[0][0];
	
	rotated90[1][0] = array[2][1];
	rotated90[1][1] = array[1][1];
	rotated90[1][2] = array[0][1];
	
	rotated90[2][0] = array[2][2];
	rotated90[2][1] = array[1][2];
	rotated90[2][2] = array[0][2];
	
	return rotated90
}

GameBoard.prototype.getFlippedBoard = function(flip, array) {
	var flipped = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
	
	if (flip == 1) {
		flipped[0][0] = array[0][2];
		flipped[0][1] = array[0][1];
		flipped[0][2] = array[0][0];
		
		flipped[1][0] = array[1][2];
		flipped[1][1] = array[1][1];
		flipped[1][2] = array[1][0];
		
		flipped[2][0] = array[2][2];
		flipped[2][1] = array[2][1];
		flipped[2][2] = array[2][0];
	} else if (flip == 2) {
		flipped[0][0] = array[2][2];
		flipped[0][1] = array[2][1];
		flipped[0][2] = array[2][0];
		
		flipped[1][0] = array[1][2];
		flipped[1][1] = array[1][1];
		flipped[1][2] = array[1][0];
		
		flipped[2][0] = array[0][2];
		flipped[2][1] = array[0][1];
		flipped[2][2] = array[0][0];
		/*flipped[0][0] = array[2][0];
		flipped[0][1] = array[2][1];
		flipped[0][2] = array[2][2];
		
		flipped[1][0] = array[1][0];
		flipped[1][1] = array[1][1];
		flipped[1][2] = array[1][2];
		
		flipped[2][0] = array[0][0];
		flipped[2][1] = array[0][1];
		flipped[2][2] = array[0][2];*/
	} else if (flip == 3) {
		flipped[0][0] = array[0][0];
		flipped[0][1] = array[1][0];
		flipped[0][2] = array[2][0];
		
		flipped[1][0] = array[0][1];
		flipped[1][1] = array[1][1];
		flipped[1][2] = array[2][1];
		
		flipped[2][0] = array[0][2];
		flipped[2][1] = array[1][2];
		flipped[2][2] = array[2][2];
		/*flipped[0][0] = array[2][2];
		flipped[0][1] = array[2][1];
		flipped[0][2] = array[2][0];
		
		flipped[1][0] = array[1][2];
		flipped[1][1] = array[1][1];
		flipped[1][2] = array[1][0];
		
		flipped[2][0] = array[0][2];
		flipped[2][1] = array[0][1];
		flipped[2][2] = array[0][0];*/
	} else {
		flipped = array;
	}
	
	return flipped;
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
	var xPos =  this.width * (((y + 1) * .3) - .1);
	var yPos = this.height * (((x + 1) * .3) - .1);
	
	console.debug("index of cell: ", x, ', ', y);
	
	this.gameMoves += x * 3 + y;
	console.debug(this.gameMoves);
	
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
	//console.log(pathString);
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