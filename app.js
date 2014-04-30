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
	var cellArrayX = -1;
	var cellArrayY = -1;
	
	// Check for any special cases
	var move;
	var specialCase;
	
	// Special case 1
	/*specialCase = this.checkSpecialCase("54017");
	if (specialCase != false) {
		move = this.makeDefinedMove(specialCase, 2, 2);
		console.debug("is a special case");
		if (this.cells[move[0]][move[1]] == -1) {
			cellArrayX = move[0];
			cellArrayY = move[1];
			console.debug("blocking special case 1");
		}
	}*/
	
	// Special case 1
	specialCase = this.checkSpecialCase("540");
	if (specialCase != false) {
		move = this.makeDefinedMove(specialCase, 2, 0);
		console.debug("is a special case");
		if (this.cells[move[0]][move[1]] == -1) {
			cellArrayX = move[0];
			cellArrayY = move[1];
			console.debug("blocking special case 1");
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
			cellArrayX = 1;
			cellArrayY = 2;
		} else if (this.cells[1][1] == 0 && this.cells[2][2] == 0 && this.cells[0][2] == -1) {
			// If AI top left and player center and bot right, take bot left
			cellArrayX = 0;
			cellArrayY = 2;
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

GameBoard.prototype.makeDefinedMove = function(flipRot, x, y) {
	// Alter pos by flip case
	switch (flipRot[0]) {
		case 1: // x flip
			x = 2 - x;
			break;
		case 2: // y flip
			y = 2 - y;
			break;
		case 3: // xy flip
			x = 2 - x;
			y = 2 - y;
			break;
	}
	
	// Alter pos by rot case
	switch (flipRot[1]) {
		case 1: // 90cw
			var temp = x;
			x = y;
			y = 2 - temp;
			break;
		case 2: // 180cw
			var temp = x;
			x = 2 - y;
			y = temp;
			break;
		case 3: // 270cw
			var temp = x;
			x = 2 - y;
			y = 2 - temp;
			break;
	}
	
	// Return altered pos
	return [x,y];
}

GameBoard.prototype.checkSpecialCase = function(board) {
	// Define rotated boards
	var rot090 = new Array(3);
	var rot180 = new Array(3);
	var rot270 = new Array(3);
	
	// Create 2D array for each board
	for (var i = 0; i < rot090.length; i++) {
		rot090[i] = new Array(3);
		rot180[i] = new Array(3);
		rot270[i] = new Array(3);
	}
	
	// Set to empty board
	for (var col = 0; col < 3; col++) {
		for (var row = 0; row < 3; row++) {
			rot090[row][col] = -1;
			rot180[col][row] = -1;
			rot270[row][col] = -1;
		}
	}
	
	// Set rotated moves for each board
	for (var col = 0; col < 3; col++) {
		for (var row = 0; row < 3; row++) {
			rot090[row][2 - col] = this.cells[row][col];
			rot180[2 - col][2 - row] = this.cells[row][col];
			rot270[2 - row][col] = this.cells[row][col];
		}
	}
	
	// Used if current flip doesn't work
	var didBreak = false;
	
	// Compare original case to normal board
	norm: for (var i = 0; i < board.length; i++) {
		// Set original pos for normal board
		var x = Math.floor(parseInt(board.charAt(i)) % 3);
		var y = Math.floor(parseInt(board.charAt(i)) / 3);
		
		if (this.cells[x][y] != i % 2 && // Normal
			rot090[x][y] != i % 2 &&
			rot180[x][y] != i % 2 &&
			rot270[x][y] != i % 2) {
			didBreak = true;
			break norm;
			//goto xflip;
			}
	}
	
	if (!didBreak) return this.checkRot(rot090, rot180, rot270, 0);
	
	didBreak = false;
	
	// Compare original case to x flip board
	xflip: for (var i = 0; i < board.length; i++) {
		// Set original pos for normal board
		var x = Math.floor(parseInt(board.charAt(i)) % 3);
		var y = Math.floor(parseInt(board.charAt(i)) / 3);
		
		if (this.cells[2 - x][y] != i % 2 && // X flip
			rot090[2 - x][y] != i % 2 &&
			rot180[2 - x][y] != i % 2 &&
			rot270[2 - x][y] != i % 2) {
			didBreak = true;
			break xflip;
			//goto yflip;
		}
	}
	
	if (!didBreak) return this.checkRot(rot090, rot180, rot270, 1);
	
	didBreak = false;
	
	// Compare original case to y flip board
	yflip: for (var i = 0; i < board.length; i++) {
		// Set original pos for normal board
		var x = Math.floor(parseInt(board.charAt(i)) % 3);
		var y = Math.floor(parseInt(board.charAt(i)) / 3);
		
		if (this.cells[x][2 - y] != i % 2 && // Y flip
			rot090[x][2 - y] != i % 2 &&
			rot180[x][2 - y] != i % 2 &&
			rot270[x][2 - y] != i % 2) {
			didBreak = true;
			break yflip;
			//goto xyflip;
		}
	}
	
	if (!didBreak) return this.checkRot(rot090, rot180, rot270, 2);
	
	// Compare original case to xy flip board
	xyflip: for (var i = 0; i < board.length; i++) {
		// Set original pos for normal board
		var x = Math.floor(parseInt(board.charAt(i)) % 3);
		var y = Math.floor(parseInt(board.charAt(i)) / 3);
		
		if (this.cells[2 - x][2 - y] != i % 2 && // XY flip
			rot090[2 - x][2 - y] != i % 2 &&
			rot180[2 - x][2 - y] != i % 2 &&
			rot270[2 - x][2 - y] != i % 2)
			return false;
	}
	
	return this.checkRot(rot090, rot180, rot270, 3);
}

GameBoard.prototype.checkRot = function(a, b, c, flip) {
	// Find rotation of current board relative to original move
	var aFail = false;
	var bFail = false;
	var cFail = false;
	
	// Check rotations with flips
	// a-90cw, b-180cw, c-270cw
	switch (flip) {
		case 0: // No flip
			for (var col = 0; col < 3; col++) {
				for (var row = 0; row < 3; row++) {
					if (a[row][col] != this.cells[row][col] && !aFail) aFail = true;
					if (b[row][col] != this.cells[row][col] && !bFail) bFail = true;
					if (c[row][col] != this.cells[row][col] && !cFail) cFail = true;
				}
			}
			break;
		case 1: // X flip
			for (var col = 0; col < 3; col++) {
				for (var row = 0; row < 3; row++) {
					if (a[2 - row][col] != this.cells[row][col] && !aFail) aFail = true;
					if (b[2 - row][col] != this.cells[row][col] && !bFail) bFail = true;
					if (c[2 - row][col] != this.cells[row][col] && !cFail) cFail = true;
				}
			}
			break;
		case 2: // Y flip
			for (var col = 0; col < 3; col++) {
				for (var row = 0; row < 3; row++) {
					if (a[row][2 - col] != this.cells[row][col] && !aFail) aFail = true;
					if (b[row][2 - col] != this.cells[row][col] && !bFail) bFail = true;
					if (c[row][2 - col] != this.cells[row][col] && !cFail) cFail = true;
				}
			}
			break;
		case 3: // XY flip
			for (var col = 0; col < 3; col++) {
				for (var row = 0; row < 3; row++) {
					if (a[2 - row][2 - col] != this.cells[row][col] && !aFail) aFail = true;
					if (b[2 - row][2 - col] != this.cells[row][col] && !bFail) bFail = true;
					if (c[2 - row][2 - col] != this.cells[row][col] && !cFail) cFail = true;
				}
			}
			break;
	}
	
	// Returns flip and rotation value of matching board
	if (!aFail)
		return [flip, 1];
	else if (!bFail)
		return [flip, 2];
	else if (!cFail)
		return [flip, 3];
	else // Returns normal board if all else fail
		return [flip, 0];
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