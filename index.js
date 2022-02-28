const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const {User, Game} = require('./server.js')
const app = express();
const port = 3003;

/*
 *  CREATE GLOBAL VAR FOR GAME BOARD
 */
let gameState = [' ', ' ', ' ',
                 ' ', ' ', ' ',  
                 ' ', ' ', ' ']

/*
 * SETUP EXPRESS REQUEST HANDLING 
 */

app.set('views', './views');
app.set('view engine', 'pug');

app.use(parser.json());
app.use(parser.urlencoded({extended: true}))

app.use(express.static('./'));

app.get("/ttt/play", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {grid: gameState});
});

app.post("/ttt/", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {grid: gameState});
});

app.post('/adduser', async function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    let {username, password, email} = req.body;

    existingUser = await User.findOne({username: username});
    if(existingUser){
        return res.json({
            status:"ERROR"
        });
    }

    let newUser = new User({
        username, password, email
    });

    let savedUser = newUser.save()
    if(!savedUser){
        return res.json({
            status:"ERROR"
        });
    }

    return res.json({
        status: "OK"
    })  

});

app.post('/verify', async function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    let {email, key} = req.body;

    user = await User.findOne({email: email});

    if(!user){
        return res.json({
            status:"ERROR"
        });
    }

    if(key !== "abracadabra"){
        return res.json({
            status:"ERROR"
        });
    }
    user.verified = true;
    user.save().then(() => {
        return res.json({
            status: "OK"
        });
    });
});

app.post('/ttt/play', function(req, res) {
    // get the board sent by client
    var ttt_board = req.body.grid;

    // make our move, and get the winner
    var result = playGame(ttt_board);

    // save the new board
    gameState = ttt_board;

    // create the response object
    var responseJson = {};
    responseJson.grid = gameState;
    if(result){
        responseJson.winner = result;
    }

    // send the response
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.json(responseJson);
});

/*
 *  SET EXPRESS TO LISTEN
 */

app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
})


/*
 *  HELPER FUNCTIONS
 */

function playGame (grid) {
    // check if the player just won, if so return
    var winner = checkWinner(grid);
    if(winner !== ' '){
        return winner;
    }
   
    // find the open squares
    let open =[];
    for(let i = 0; i < 9; i++){
        if(grid[i] === ' '){
            open.push(i);
        }
    }

    // if there are no open squares, its a tie
    if (open.length === 0) {
        return ' ';
    }

    // otherwise, make a move
    index = open[Math.floor(Math.random() * open.length)];
    grid[index] = 'O';

    // check if the server just won
    winner = checkWinner(grid);
    if(winner !== ' '){
        return winner
    }
    return undefined;
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