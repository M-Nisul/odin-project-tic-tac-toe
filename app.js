const playButton = document.getElementById('lets-play');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const quitButton = document.getElementById('quit');

const createTiles = (row, col, isTaken, player) => {
    return {row, col, isTaken, player};
}

const createPlayer = (playerName,symbol) => {
    
    return {playerName, symbol};
}

const gameBoard = (function () {
    const tiles = [createTiles(1,1,false,null), createTiles(1,2,false,null), createTiles(1,3,false,null), createTiles(2,1,false,null), createTiles(2,2,false,null), createTiles(2,3,false,null), createTiles(3,1,false,null), createTiles(3,2,false,null), createTiles(3,3,false,null)];
    return {tiles};
})();

const checkWin = (function () {
    const checkLine = (start, step, player) => {
        for (let i = 0; i < 3; i++) {
            let tile = gameBoard.tiles[start + step * i];
            if (!tile || tile.player !== player) {
                return false;
            }
        }
        return true;
    }

    const checkWin = (index, player) => {
        let row = Math.floor(index / 3);
        let col = index % 3;

        // Check the row
        if (checkLine(row * 3, 1, player)) {
            return true;
        }

        // Check the column
        if (checkLine(col, 3, player)) {
            return true;
        }

        // Check the diagonals
        if (col === row && checkLine(0, 4, player)) {
            return true;
        }
        if (col + row === 2 && checkLine(2, 2, player)) {
            return true;
        }

        return false;
    }

    return { checkWin };
})();


const displayController = (function () {
    const displayTiles = () => {
        gameBoard.tiles.forEach((item,index) => {
        let tile = document.createElement('button');
        tile.classList.add('tile');
        tile.dataset.index = index;
        tile.addEventListener('click',()=>{
            playerController.tileSelect(tile,index);
            console.log(gameBoard.tiles);
        })
        document.getElementById('gameBoard').appendChild(tile);
    })};
    
    const selectTile = (tile,player) => {
        tile.innerHTML = player.symbol;
        tile.disabled = true;
    }
    return{displayTiles,selectTile}
})();

const checkTies = (function() {
    const checkTie = (gameBoard) => {
        if(gameBoard.every(tile => tile.isTaken === true)){
            return true
        }
    }

    return {checkTie}
})();

const reset = (function(){
    const resetBoard = (board) => {
        board.forEach(item => {
            item.isTaken = false;
            item.player = null;
        });    
    }

    const resetDisplay = () => {
        const gameBoardElement = document.getElementById('gameBoard');
        while (gameBoardElement.firstChild) {
            gameBoardElement.removeChild(gameBoardElement.firstChild);
        }
        displayController.displayTiles();
    };

    const resetWhole = (board) => {
        resetBoard(board);
        resetDisplay();
    }

    const quit = () => {
        location.reload();
    }

    return{resetWhole, quit};
})();

const playerController = (function () {
    let player1;
    let player2;
    let currentPlayer;

    let player1Wins = 0;
    let player1Losses = 0;
    let player2Wins = 0;
    let player2Losses = 0;
    let playerTies = 0;

    const createPlayers = (player1Name, player2Name) => {
        player1 = createPlayer(player1Name, 'X');
        player2 = createPlayer(player2Name, 'O');
        currentPlayer = player1;
    }

    const retry = (function(){
        const retry = (gameBoard) => {
            document.getElementById('gameBoard').classList.add('retry');
            const retryButton = document.getElementById('retry-button');
            retryButton.classList.add('show');
            retryButton.classList.remove('none');
            const onRetry = () => {
                retryButton.classList.add('animate-button');
                setTimeout(()=>{
                        retryButton.classList.remove('animate-button');
                        retryButton.classList.remove('show');
                        retryButton.classList.add('none');
                        document.getElementById('gameBoard').classList.remove('retry');
                        reset.resetWhole(gameBoard);
                        retryButton.removeEventListener('click',onRetry);
                },1500)
            }
            retryButton.addEventListener('click',onRetry);
        }
        return{retry}
    })();

    const tileSelect = (tile,index) => {
        if(tile.innerHTML !== ''){
            return;
        }else{
            displayController.selectTile(tile,currentPlayer);
            gameBoard.tiles[index].isTaken = true;
            gameBoard.tiles[index].player = currentPlayer.symbol;
            if(checkWin.checkWin(index,currentPlayer.symbol)){
                console.log(currentPlayer.playerName +  ' has Won!');
                if(currentPlayer.symbol === 'X'){
                    player1Wins++;
                    player2Losses++;
                    document.getElementById('1wins').innerHTML = player1Wins;
                    document.getElementById('2losses').innerHTML = player2Losses;
                    retry.retry(gameBoard.tiles);
                }else if(currentPlayer.symbol === 'O'){
                    player2Wins++;
                    player1Losses++;
                    document.getElementById('2wins').innerHTML = player2Wins;
                    document.getElementById('1losses').innerHTML = player1Losses;
                    retry.retry(gameBoard.tiles);
                }
            }else if(checkWin.checkWin(index,currentPlayer.symbol) === false && checkTies.checkTie(gameBoard.tiles) === true){
                playerTies++;
                document.getElementById('1ties').innerHTML = playerTies;
                document.getElementById('2ties').innerHTML = playerTies;
                retry.retry(gameBoard.tiles);
            }
            
            currentPlayer = currentPlayer === player1 ? player2 : player1;
        }
    }
    return {tileSelect,createPlayers};
})();

playButton.disabled = true;

const enableButton = () => {
    playButton.disabled = !(player1Input.value && player2Input.value)
}

player1Input.addEventListener('input', enableButton);
player2Input.addEventListener('input', enableButton);

window.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault(); // Prevent the default action
        playButton.click(); // Programmatically click the button
    }
});

playButton.addEventListener('click',()=>{
    const player1 = player1Input.value;
    const player2 = player2Input.value;
    playerController.createPlayers(player1,player2);
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    document.getElementById('player1Info').innerHTML = player1;
    document.getElementById('player2Info').innerHTML = player2;
    
    displayController.displayTiles();
});

quitButton.addEventListener('click',reset.quit);
