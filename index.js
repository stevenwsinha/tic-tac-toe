const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const app = express();
const port = 3003;

let gameState = [' ', ' ', ' ',
                 ' ', ' ', ' ',  
                 ' ', ' ', ' ']

app.set('views', './views');
app.set('view engine', 'pug');

app.use(parser.json());
app.use(parser.urlencoded({extended: true}))

app.use(express.static('./'));

app.get("/ttt/", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {grid: gameState});
});

app.post("/ttt/", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {grid: gameState});
});

app.post('/ttt/play', function(req, res) {
    console
    var ttt_board = req.body.grid;
    var result = playGame(ttt_board);
    gameState = ttt_board;

    res.set('X-CSE356', '61f9cee64261123151824fcd');
    var responseJson = {};
    responseJson.grid = gameState;
    responseJson.winner = result;
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.json(responseJson);
});

app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
})

function playGame (grid) {
    var err = checkWinner(grid);
    if(err !== ' '){
        return err;
    }
   
    grid[4] = 'O'
    
    err = checkWinner(grid);
    return err;
}

function checkWinner(grid){
    // check if somebody has won on the rows
    if( grid[0] === grid[1] && grid[0] === grid[2]){
        return grid[0]
    }
    if( grid[3] === grid[4] && grid[3] === grid[5]){
        return grid[3]
    }
    if( grid[6] === grid[7] && grid[6] === grid[8]){
        return grid[6]
    }

    // check if somebody has won on cols
    if( grid[0] === grid[3] && grid[0] === grid[6]){
        return grid[0]
    }
    if( grid[1] === grid[4] && grid[1] === grid[7]){
        return grid[1]
    }
    if( grid[2] === grid[5] && grid[2] === grid[8]){
        return grid[2]
    }

    // check if someone has won on diags
    if(grid[0] == grid[4] && grid[0] == grid[8]){
        return grid[0]
    }
    if(grid[2] === grid[4] && grid[2] === grid[6]){
        return grid[2]
    }
    return ' '
}