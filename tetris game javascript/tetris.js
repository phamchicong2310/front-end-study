const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d"); 
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = 10;
const SQUARE_SIZE = SQ = 20;
const BOAR_COLOR = "WHITE";

// draw square 
function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x*SQ, y*SQ, SQ, SQ);

	ctx.strokeStyle = "BLACK"
	ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}
//create the board array 
let board = [];
for (i = 0; i < ROW; i++) {
	board[i] = [];
	for (j = 0; j < COL; j++) {
		board[i][j] = BOAR_COLOR;
	}
}
	
// draw board func
function drawBoard() {
	for ( i = 0; i < ROW; i++) {
		for (j = 0; j < COL; j++) {
			drawSquare(j, i, board[i][j]);
		}
	}
}
drawBoard();
// create array Tetromino and their color
const PIECES = [
	[I, "orange"],
	[J, "purple"],
	[L, "green"],
	[O, "red"],
	[S, "blue"],
	[T, "yellow"],
	[Z, "cyan"]
];


//create random tetris function
function randomTetris() {
	let r = Math.floor(Math.random() * PIECES.length);
	return new Tetris(PIECES[r][0], PIECES[r][1])
}
let tetris = randomTetris(); 

// create tetris object 
function Tetris(tetromino, color) {
	this.tetromino = tetromino;
	this.color = color;
	this.indexTetromino = 0; //start from first pattern
	this.activeTetromino = tetromino[this.indexTetromino];
	this.x = 3; // start position of tetris
	this.y = -2;
}
// this method to fill a tetris pattern with specified color
Tetris.prototype.fill = function(color) {
	for (i = 0; i < this.activeTetromino.length; i++) {
		for (j = 0; j < this.activeTetromino.length; j++) {
			if(this.activeTetromino[i][j]) {
				drawSquare(this.x + j, this.y + i, color);
			}
		}
	}
}
Tetris.prototype.draw = function() {
	this.fill(this.color);
}
Tetris.prototype.unDraw = function() {
	this.fill(BOAR_COLOR);
}
// this method increase not emty square 1 unit of position and check with xBoard yBoard and wall to detect collision 
Tetris.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // skip newY < 0; bug logic in lock function
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece already in place
            if( board[newY][newX] != BOAR_COLOR){
                return true;
            }
        }
    }
    return false;
}
var score = 0;
Tetris.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the emty squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != BOAR_COLOR);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = BOAR_COLOR;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}
//move down and lock tetris
Tetris.prototype.moveDown = function() {
	if(!this.collision(0, 1, this.activeTetromino)) {
		this.unDraw();
		this.y++;
		this.draw();
	}else {
		this.lock();
		tetris = randomTetris();
	}
}
Tetris.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Tetris.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Tetris.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.indexTetromino + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.indexTetromino = (this.indexTetromino + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.indexTetromino];
        this.draw();
    }
}		
	
				
		
// add input keyboard listener
document.addEventListener("keydown", INPUTKEYBOARD);
function INPUTKEYBOARD (event) {
	if (event.keyCode == 37) {
		tetris.moveLeft();
		dropStart = Date.now();
	}else if (event.keyCode == 38) {
		tetris.rotate();
		dropStart = Date.now();
	}else if (event.keyCode == 39) {
		tetris.moveRight();
		dropStart = Date.now();
	}else if (event.keyCode == 40) {
		tetris.moveDown();
	}
}

let dropStart = Date.now();
let gameOver = false;
function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	if(delta > 1000) {
		tetris.moveDown();
		dropStart = Date.now();
	}
	if(!gameOver) {
		requestAnimationFrame(drop);
	}
}
drop();
	
		
		
		
		
		

	
