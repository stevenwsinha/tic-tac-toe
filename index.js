const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const cookieParser = require('cookie-parser')
const {User} = require('./server.js') 
const {Game} = require('./server.js');
const { all } = require('express/lib/application');
const app = express();
const port = 3003;


// TO DO: 
// UPDATE POST AT TTT/PLAY TO CONFORM TO NEW GAME STANDARD
// MAKE A SAVE GAME FUNCTION THAT SAVES A GAME TO THE DB, CALL IT CONDITIONALLY
// TTT/PLAY POST HANDLER

// MAKE FUNCTIONS THAT FETCH ALL GAMES/ FETCH FROM ONE USER/ FILTER GAMES, ETC 
// THEY DONT NEED TO BE SEPARATE FUNCTIONS THEY CAN BE INSIDE THE POST RESPONSE 
// TO THE DIFFERENT ENDPOINTS

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
app.use(cookieParser());

app.use(express.static('./'));

app.get("/ttt/play", function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.render('index', {grid: gameState});
});

app.post("/ttt/", function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.render('index', {grid: gameState});
});

app.post('/adduser', async function(req, res) {

    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {username, password, email} = req.body;
    console.log(`Received verify request for user: ${username} with email: ${email} and password: ${password}`);

    existingUser = await User.findOne({username: username});
    if(existingUser){
        console.log("User with that username already exists");
        return res.json({
            status:"ERROR"
        });
    }

    let newUser = new User({
        username, password, email
    });

    newUser.verified = false;

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
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {email, key} = req.body;
    console.log(`Received verify request for user: ${email} with key: ${key}`);

    await User.findOne({email: email}).then((user) => {
        if(key !== "abracadabra"){
            console.log("invalid key")
            return res.json({
                status:"ERROR"
            });
        }
        user.verified = true;
        user.save().then(() => {
            return res.json({
                status: "OK"
            });
        })
    })
});

app.post('/login', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    let {username, password} = req.body;
    console.log(`Recieved login request for user: ${username} with password: ${password}`)

    await User.findOne({username: username}).then((user) => {
        if(password !== user.password){
            console.log("invalid password")
            return res.json({
                status:"ERROR"
            });
        }

        res.cookie('id', user._id);
        return res.json({
            status: "OK"
        });
    })

});

app.post('/logout', async function(req, res) {
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
    res.clearCookie('id');
    return res.json({
        status: "OK"
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
    res.set('X-CSE356', '620bd941dd38a6610218bb1b');
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